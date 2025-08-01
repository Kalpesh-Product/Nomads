import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import Inclusions from "../models/coworking/Inclusions.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const addCompanyInclusions = async (req, res, next) => {
  try {
    const {
      coworkingCompany,
      businessName,
      airCondition,
      fastInternet,
      secure,
      receptionist,
      cafeDining,
      generator,
      teaCoffee,
      assist,
      housekeeping,
      itSupport,
      workspace,
      meetingRooms,
      trainingRooms,
      television,
      maintenance,
      onDemand,
      community,
      pickupDrop,
      transportOptions,
      personalised,
      gamingZone,
      furnishedOffice,
      freeCoffee,
      stationery,
      library,
      parking,
      ergonomicEnvironment,
      privateStorage,
      freeLoungeAccess,
      dailyCleaning,
      officeSupplies,
      printingServices,
      access24x7,
      deepWorkZones,
      closeToNature,
      backupNetworks,
      signBoard,
    } = req.body;

    const newInclusion = new Inclusions({
      coworkingCompany,
      businessName,
      airCondition,
      fastInternet,
      secure,
      receptionist,
      cafeDining,
      generator,
      teaCoffee,
      assist,
      housekeeping,
      itSupport,
      workspace,
      meetingRooms,
      trainingRooms,
      television,
      maintenance,
      onDemand,
      community,
      pickupDrop,
      transportOptions,
      personalised,
      gamingZone,
      furnishedOffice,
      freeCoffee,
      stationery,
      library,
      parking,
      ergonomicEnvironment,
      privateStorage,
      freeLoungeAccess,
      dailyCleaning,
      officeSupplies,
      printingServices,
      access24x7,
      deepWorkZones,
      closeToNature,
      backupNetworks,
      signBoard,
    });

    const saved = await newInclusion.save();
    res.status(201).json({
      message: "Inclusions added successfully",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyInclusions = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "CoworkingCompany ID is required." });
    }

    const inclusions = await Inclusions.findOne({ businessId: companyId });

    if (!inclusions) {
      return res
        .status(404)
        .json({ message: "Inclusions not found for this company." });
    }

    res.status(200).json({
      message: "Inclusions fetched successfully",
      data: inclusions,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkInsertInclusions = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const companies = await CoworkingCompany.find().lean().exec();
    const companyMap = new Map(
      companies.map((company) => [company.businessId, company._id.toString()])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const inclusions = [];

    const normalize = (value) => value?.toLowerCase() === "yes";

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = companyMap.get(row["Business ID"]?.trim());
        const inclusion = {
          coworkingCompany: businessId,
          airCondition: normalize(row["Air Condition"]),
          fastInternet: normalize(row["Fast Internet"]),
          secure: normalize(row["Secure"]),
          receptionist: normalize(row["Receptionist"]),
          cafeDining: normalize(row["Cafe / Dining"]),
          generator: normalize(row["Generator"]),
          teaCoffee: normalize(row["Tea & Coffee"]),
          assist: normalize(row["Assist"]),
          housekeeping: normalize(row["Housekeeping"]),
          itSupport: normalize(row["IT Support"]),
          workspace: normalize(row["Workspace"]),
          meetingRooms: normalize(row["Meeting Rooms"]),
          trainingRooms: normalize(row["Training Rooms"]),
          television: normalize(row["Television"]),
          maintenance: normalize(row["Maintenance"]),
          onDemand: normalize(row["On Demand"]),
          community: normalize(row["Community"]),
          pickupDrop: normalize(row["Pickup & Drop"]),
          transportOptions: {
            car: row["Car / Bike / Bus"]?.toLowerCase().includes("car"),
            bike: row["Car / Bike / Bus"]?.toLowerCase().includes("bike"),
            bus: row["Car / Bike / Bus"]?.toLowerCase().includes("bus"),
          },
          personalised: normalize(row["Personalised"]),
          gamingZone: normalize(row["Gaming Zone"]),
          furnishedOffice: normalize(row["Furnished Office"]),
          freeCoffee: normalize(row["Free coffee"]),
          stationery: normalize(row["Stationery"]),
          library: normalize(row["Library"]),
          parking: normalize(row["Parking"]),
          ergonomicEnvironment: normalize(row["Ergonomic Environment"]),
          privateStorage: normalize(row["Private Storage"]),
          freeLoungeAccess: normalize(row["Free lounge access"]),
          dailyCleaning: normalize(row["Daily cleaning"]),
          officeSupplies: normalize(row["Office Supplies"]),
          printingServices: normalize(row["Printing services"]),
          access24x7: normalize(row["24/7 access"]),
          deepWorkZones: normalize(row["Deep Work Zones"]),
          closeToNature: normalize(row["Close to nature"]),
          backupNetworks: normalize(row["Backup Networks"]),
          signBoard: normalize(row["Sign Board"]),
        };

        inclusions.push(inclusion);
      })
      .on("end", async () => {
        if (inclusions.length > 0) {
          await Inclusions.insertMany(inclusions);
          return res
            .status(200)
            .json({ message: `${inclusions.length} inclusions inserted.` });
        } else {
          return res
            .status(400)
            .json({ message: "No valid inclusions found." });
        }
      })
      .on("error", (err) => next(err));
  } catch (error) {
    next(error);
  }
};
