import ColivingInclusions from "../../models/coliving/ColivingInclusions.js";
import ColivingCompany from "../../models/coliving/ColivingCompany.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertColivingInclusions = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        ?.trim()
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    const colivingCompanies = await ColivingCompany.find().lean().exec();
    const colivingCompaniesMap = new Map(
      colivingCompanies.map((company) => [company.businessId, company._id])
    );

    const inclusionsList = [];

    const stream = Readable.from(file.buffer.toString("utf-8")?.trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"];
        const colivingCompanyId = colivingCompaniesMap.get(businessId);

        if (!colivingCompanyId) return;

        const inclusion = {
          colivingCompany: colivingCompanyId,
          electricity: row["Electricity"]?.trim()?.toLowerCase() === "yes",
          wifi: row["Wifi"]?.trim()?.toLowerCase() === "yes",
          water: row["Water"]?.trim()?.toLowerCase() === "yes",
          cleaning: row["Cleaning"]?.trim()?.toLowerCase() === "yes",
          washingMachine: row["Washing machine"]?.toLowerCase() === "yes",
          fridge: row["Fridge"]?.trim()?.toLowerCase() === "yes",
          kitchen: row["Kitchen"]?.trim()?.toLowerCase() === "yes",
          ac: row["AC"]?.trim()?.toLowerCase() === "yes",
          attachedBathroom:
            row["Attached bathroom"]?.trim()?.toLowerCase() === "yes",
          balcony: row["Balcony"]?.trim()?.toLowerCase() === "yes",
          cots: row["Cots"]?.trim()?.toLowerCase() === "yes",
          cupboard: row["Cupboard"]?.trim()?.toLowerCase() === "yes",
          geyser: row["Geyser"]?.trim()?.toLowerCase() === "yes",
          pillow: row["Pillow"]?.trim()?.toLowerCase() === "yes",
          sideTable: row["Side table"]?.trim()?.toLowerCase() === "yes",
          softFurnishing:
            row["Soft furnishing"]?.trim()?.toLowerCase() === "yes",
          tv: row["TV"]?.trim()?.toLowerCase() === "yes",
          mattress5Inch: row["Mattress 5inch"]?.trim()?.toLowerCase() === "yes",
          shoeRack: row["Shoe Rack"]?.trim()?.toLowerCase() === "yes",
          dth: row["DTH"]?.trim()?.toLowerCase() === "yes",
          bedTypeQueen5x6:
            row["Bed Type Queen 5x6"]?.trim()?.toLowerCase() === "yes",
          mattressQueen8Inch:
            row["Mattress Queen 8inch"]?.trim()?.toLowerCase() === "yes",
          cctv: row["CCTV"]?.trim()?.toLowerCase() === "yes",
          lift: row["Lift"]?.trim()?.toLowerCase() === "yes",
          ro: row["RO"]?.trim()?.toLowerCase() === "yes",
          workdesk: row["Workdesk"]?.trim()?.toLowerCase() === "yes",
          bedLinenAndTowels:
            row["Bed Linen and Towels"]?.trim()?.toLowerCase() === "yes",
          hotWater24Hours:
            row["24 Hours Hot water"]?.trim()?.toLowerCase() === "yes",
          electronicLock:
            row["Electronic Lock"]?.trim()?.toLowerCase() === "yes",
          coworkingSpace:
            row["Co-working Space"]?.trim()?.toLowerCase() === "yes",
          lounge: row["Lounge"]?.trim()?.toLowerCase() === "yes",
          swimmingPool: row["Swimming pool"]?.trim()?.toLowerCase() === "yes",
          yogaZone: row["Yoga Zone"]?.trim()?.toLowerCase() === "yes",
          frontDesk: row["Front Desk"]?.trim()?.toLowerCase() === "yes",
          sharedWashroom:
            row["Shared Washroom"]?.trim()?.toLowerCase() === "yes",
          lockers: row["Lockers"]?.trim()?.toLowerCase() === "yes",
          homeTheatre: row["Home Theatre"]?.trim()?.toLowerCase() === "yes",
          indoorGames: row["Indoor Games"]?.trim()?.toLowerCase() === "yes",
          luggageRoom: row["Luggage Room"]?.trim()?.toLowerCase() === "yes",
          laundry: row["Laundry"]?.trim()?.toLowerCase() === "yes",
        };

        inclusionsList.push(inclusion);
      })
      .on("end", async () => {
        if (inclusionsList.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid inclusions to insert" });
        }

        await ColivingInclusions.insertMany(inclusionsList);
        res.status(200).json({
          message: "Inclusions inserted successfully",
          count: inclusionsList.length,
        });
      });
  } catch (error) {
    next(error);
  }
};
