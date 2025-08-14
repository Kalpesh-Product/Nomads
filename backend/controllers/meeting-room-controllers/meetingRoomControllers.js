import MeetingRoom from "../../models/Meeting/MeetingRoom.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const bulkInsertMeetingRooms = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }
    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const meetingRooms = [];
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const meetingRoom = {
          businessId: row["Business ID"]?.trim(),
          businessName: row["Business Name"]?.trim(),
          registeredEntityName: row["Registered Entity name"]?.trim(),
          website: row["Website"]?.trim(),
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          country: row["Country"]?.trim(),
          state: row["State"]?.trim(),
          about: row["About"]?.trim(),
          totalSeats: parseInt(row["Total Seats"]) || null,
          latitude: parseFloat(row["latitude"]?.trim()),
          longitude: parseFloat(row["longitude"]?.trim()),
          googleMap: row["Google map"]?.trim(),
          ratings: parseFloat(row["Ratings"]) || null,
          totalReviews: row["Total Reviews"]
            ? parseInt(row["Total Reviews"]?.trim())
            : 0,
          inclusions: row["Inclusions"]
        };

        meetingRooms.push(meetingRoom);
      })
      .on("end", async () => {
        try {
          const businessIds = meetingRooms.map((w) => w.businessId);
          const existing = await MeetingRoom.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = meetingRooms.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await MeetingRoom.insertMany(toInsert);
          res.status(201).json({
            message: `Successfully inserted ${inserted.length} workations.`,
            data: inserted,
          });
        } catch (insertErr) {
          next(insertErr);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
