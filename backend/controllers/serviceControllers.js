import Services from "../models/coworking/Services.js";
import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const addCompanyService = async (req, res, next) => {
  try {
    const {
      company,
      hotDesk,
      dedicatedDesk,
      privateCabin,
      meetingRoom,
      conferenceRoom,
      openDeskArea,
      executiveSuite,
      virtualOffice,
      eventSpace,
      phoneBooth,
      loungeArea,
      outdoorWorkspace,
      dayPass,
      focusZone,
      auditorium,
      trainingRoom,
    } = req.body;

    // Basic validation
    if (!company) {
      return res.status(400).json({ message: "CoworkingCompany ID is required." });
    }

    // Optional: check if a services entry already exists for the company
    const existing = await Services.findOne({ company });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Services already exist for this company." });
    }

    const newService = new Services({
      company,
      hotDesk,
      dedicatedDesk,
      privateCabin,
      meetingRoom,
      conferenceRoom,
      openDeskArea,
      executiveSuite,
      virtualOffice,
      eventSpace,
      phoneBooth,
      loungeArea,
      outdoorWorkspace,
      dayPass,
      focusZone,
      auditorium,
      trainingRoom,
    });

    const savedService = await newService.save();
    res.status(201).json({
      message: "CoworkingCompany services added successfully",
      data: savedService,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyService = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const services = await Services.findOne({ company: companyId })
      .lean()
      .exec();

    if (!services) {
      return res
        .status(400)
        .json({ message: "No services found for this company." });
    }
    return res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertCompanyServices = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file." });
    }

    const companies = await CoworkingCompany.find().lean().exec();
    const companiesMap = new Map(
      companies.map((c) => [c.businessId?.trim(), c._id])
    );

    const servicesToInsert = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          const businessId = row["Business Id"]?.trim();
          const companyId = companiesMap.get(businessId);

          if (!companyId) {
            console.warn(`CoworkingCompany not found for Business Id: ${businessId}`);
            return;
          }

          const service = {
            company: companyId,
            hotDesk: row["Hot Desk"]?.trim().toLowerCase() === "yes",
            dedicatedDesk:
              row["Dedicated Desk"]?.trim().toLowerCase() === "yes",
            privateCabin:
              row["Private Cabin/Office"]?.trim().toLowerCase() === "yes",
            meetingRoom: row["Meeting Room"]?.trim().toLowerCase() === "yes",
            conferenceRoom:
              row["Conference Room"]?.trim().toLowerCase() === "yes",
            openDeskArea: row["Open Desk Area"]?.trim().toLowerCase() === "yes",
            executiveSuite:
              row["Executive Suite"]?.trim().toLowerCase() === "yes",
            virtualOffice:
              row["Virtual Office"]?.trim().toLowerCase() === "yes",
            eventSpace: row["Event Space"]?.trim().toLowerCase() === "yes",
            phoneBooth:
              row["Phone Booth/Call Room"]?.trim().toLowerCase() === "yes",
            loungeArea: row["Lounge Area"]?.trim().toLowerCase() === "yes",
            outdoorWorkspace:
              row["Outdoor Workspace"]?.trim().toLowerCase() === "yes",
            dayPass: row["Day Pass "]?.trim().toLowerCase() === "yes", // Note: Check for extra spaces
            focusZone: row["Focus Zone"]?.trim().toLowerCase() === "yes",
            auditorium: row["Auditorium"]?.trim().toLowerCase() === "yes",
            trainingRoom: row["Training Room"]?.trim().toLowerCase() === "yes",
          };

          servicesToInsert.push(service);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (servicesToInsert.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid rows found to insert." });
    }

    await Services.insertMany(servicesToInsert);

    return res
      .status(200)
      .json({
        message: "Services inserted successfully.",
        count: servicesToInsert.length,
      });
  } catch (error) {
    next(error);
  }
};
