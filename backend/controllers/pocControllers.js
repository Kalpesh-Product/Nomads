import PointOfContact from "../models/PointOfContact.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import Company from "../models/Company.js";
import TestPointOfContact from "../models/TestPointOfContacts.js";
import axios from "axios";

export const bulkInsertPoc = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Please provide a valid CSV file",
      });
    }

    const companies = await Company.find().lean();
    const companyMap = new Map(
      companies.map((item) => [item.businessId?.trim(), item._id])
    );
    const companyIdMap = new Map(
      companies.map((c) => [c.businessId, c.companyId])
    );

    const existingPocs = await PointOfContact.find().select("name companyId");
    const existingPocSet = new Set(
      existingPocs.map(
        (poc) => `${poc.name?.trim().toLowerCase()}|${poc.companyId?.trim()}`
      )
    );

    // CSV parsing
    const parsedResult = await new Promise((resolve, reject) => {
      const temp = [];
      const seenInCSV = new Set();
      let skippedExisting = 0;
      let skippedDuplicateInCSV = 0;

      const stream = Readable.from(file.buffer.toString("utf-8").trim());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          const businessId = row["Business ID"]?.trim();
          const companyMongoId = companyMap.get(businessId);
          const companyId = companyIdMap.get(businessId);
          if (!companyMongoId) return;

          const pocName = row["POC Name"]?.trim();
          const pocKey = `${pocName?.toLowerCase()}|${companyId?.trim()}`;

          if (existingPocSet.has(pocKey)) {
            skippedExisting++;
            return;
          }
          if (seenInCSV.has(pocKey)) {
            skippedDuplicateInCSV++;
            return;
          }

          const languages =
            row["Languages"]?.split(",").map((lang) => lang.trim()) ||
            row["Languages"]?.trim();

          const pocData = {
            company: companyMongoId,
            companyId,
            name: pocName,
            profileImage: row["POC Image"]?.trim(),
            designation: row["POC Designation"]?.trim(),
            email: row["Email"]?.trim().toLowerCase(),
            phone: row["Phone Number"]?.trim(),
            linkedInProfile: row["LinkedIn Profile"]?.trim(),
            languagesSpoken: languages,
            address: row["Address"]?.trim(),
            availabilityTime: row["Availibility time"]?.trim(),
          };

          seenInCSV.add(pocKey);
          temp.push(pocData);
        })
        .on("end", () => {
          resolve({ pocs: temp, skippedExisting, skippedDuplicateInCSV });
        })
        .on("error", (err) => reject(err));
    });

    const { pocs, skippedExisting, skippedDuplicateInCSV } = parsedResult;

    if (!pocs.length) {
      return res.status(400).json({
        message: `No valid POC data found in CSV.\nCheck if the entries are already uploaded.`,
        skippedExisting,
        skippedDuplicateInCSV,
      });
    }

    // Insert into Nomads DB
    let nomadsStatus = "failed";
    let masterPanelStatus = "not attempted";

    try {
      await PointOfContact.insertMany(pocs);
      nomadsStatus = "success";

      const masterPanelPocs = pocs.map((poc) => ({
        companyId: poc.companyId,
        name: poc.name,
        designation: poc.designation,
        email: poc.email,
        phone: poc.phone,
        linkedInProfile: poc.linkedInProfile,
        languagesSpoken: poc.languagesSpoken,
        address: poc.address,
        profileImage: poc.profileImage,
      }));

      // console.log("Sending to master panel:", masterPanelPocs.length, "POCs");

      // Sync with master panel
      try {
        const response = await axios.post(
          "https://wonomasterbe.vercel.app/api/host-user/bulk-insert-poc",
          { pocs: masterPanelPocs },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        masterPanelStatus = `success (${response.status})`;

        return res.status(201).json({
          message: `${pocs.length} POCs inserted successfully in both databases.`,
          inserted: pocs.length,
          skippedExisting,
          skippedDuplicateInCSV,
          statusReport: {
            nomadsDB: nomadsStatus,
            masterPanel: masterPanelStatus,
          },
        });
      } catch (masterErr) {
        console.error(
          "Master panel error:",
          masterErr.response?.data || masterErr.message
        );
        masterPanelStatus = `failed (${masterErr.message})`;

        return res.status(201).json({
          message: "POCs inserted in Nomads DB, but master panel sync failed.",
          inserted: pocs.length,
          skippedExisting,
          skippedDuplicateInCSV,
          statusReport: {
            nomadsDB: nomadsStatus,
            masterPanel: masterPanelStatus,
          },
        });
      }
    } catch (nomadsErr) {
      nomadsStatus = `failed (${nomadsErr.message})`;

      return res.status(500).json({
        message: "Nomads DB upload failed. No data uploaded anywhere.",
        inserted: 0,
        skippedExisting,
        skippedDuplicateInCSV,
        statusReport: {
          nomadsDB: nomadsStatus,
          masterPanel: "not attempted",
        },
      });
    }
  } catch (error) {
    console.error("Bulk insert error:", error);
    next(error);
  }
};

export const createPOC = async (req, res, next) => {
  try {
    const payload = req.body;

    const pocData = {
      name: payload?.name,
      companyId: payload?.companyId,
      designation: payload?.designation,
      email: payload?.email,
      phone: payload?.phone,
      linkedInProfile: payload?.linkedInProfile,
      languagesSpoken: payload?.languages || [],
      address: payload?.address,
      profileImage: payload?.profileImage,
      isActive: payload?.isActive ?? true,
      availibilityTime: payload?.availibilityTime,
    };

    const poc = await PointOfContact.findOne({ email: payload.email });

    if (poc) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newPOC = new PointOfContact(pocData);
    const savedPOC = await newPOC.save();

    return res.status(201).json({
      success: true,
      message: "Point of Contact created successfully",
      data: savedPOC,
    });
  } catch (error) {
    next(error);
  }
};

export const getPocDetails = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    let query = {};

    if (companyId) {
      query = { companyId };
    }

    const pocDetails = await PointOfContact.find(query).populate({
      path: "company",
      select: "companyName",
    });

    if (!pocDetails) {
      return res.status(400).json({ message: "No POC details found" });
    }

    return res.status(200).json(pocDetails);
  } catch (error) {
    next(error);
  }
};
