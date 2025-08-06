import HostelInclusions from "../../models/hostels/Inclusions.js";
import Hostels from "../../models/hostels/Hostel.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertHostelInclusions = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const hostels = await Hostels.find().lean().exec();
    const hostelsMap = new Map(
      hostels.map((hostel) => [hostel.businessId, hostel._id])
    );
    const hostelInclusions = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    const fieldMapping = {
      "24/7 Reception": "reception24x7",
      Bar: "bar",
      "Café/Restaurant": "cafeRestaurant",
      Lounge: "lounge",
      CCTV: "cctv",
      Housekeeping: "housekeeping",
      "Wi-Fi": "wifi",
      "In-house Activities/games": "inHouseActivities",
      "24/7 Security": "security24x7",
      "A/C": "airConditioning",
      Balcony: "balcony",
      "Breakfast In Room": "breakfastInRoom",
      "Car rental": "carRental",
      "Game Room": "gameRoom",
      Garden: "garden",
      "Laundry service": "laundryService",
      "Live music / Performance": "liveMusic",
      "Outdoor Activities and Sports": "outdoorActivities",
      Parking: "parking",
      "Pool table": "poolTable",
      "Pool / Beach towels": "poolTowels",
      "Power backup": "powerBackup",
      "Room service": "roomService",
      "Sun deck": "sunDeck",
      "Swimming Pool": "swimmingPool",
      Terrace: "terrace",
      "Washing Machine": "washingMachine",
      Linen: "linen",
      Towel: "towel",
      TV: "tv",
      "Private Bathroom": "privateBathroom",
      "Hair Dryer": "hairDryer",
      Patio: "patio",
      "Pet friendly": "petFriendly",
      Workstaion: "workstation", // Note: Typo from CSV
      "Water Dispenser": "waterDispenser",
      Kettle: "kettle",
      "Work Desk": "workDesk",
      "Luggage Storage": "luggageStorage",
      Refrigerator: "refrigerator",
      "Private Locker": "privateLocker",
    };

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Busniess Id"]?.trim(); // Note: CSV typo "Busniess Id"
        const hostelId = hostelsMap.get(businessId);

        if (!hostelId) return; // skip if hostel not found

        const inclusion = { hostel: hostelId };

        for (const [csvKey, schemaKey] of Object.entries(fieldMapping)) {
          inclusion[schemaKey] = row[csvKey]?.trim()?.toLowerCase() === "yes";
        }

        hostelInclusions.push(inclusion);
      })
      .on("end", async () => {
        if (hostelInclusions.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid inclusions found in the CSV." });
        }

        await HostelInclusions.insertMany(hostelInclusions);
        res.status(200).json({
          message: `${hostelInclusions.length} hostel inclusions added successfully.`,
        });
      });
  } catch (error) {
    next(error);
  }
};
