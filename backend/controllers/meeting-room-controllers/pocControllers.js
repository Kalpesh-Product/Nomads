import MeetingRoom from "../../models/Meeting/MeetingRoom.js";
import MeetingPoc from "../../models/Meeting/PointOfContact.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const bulkInsertMeetingPoc = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const meetingRooms = await MeetingRoom.find().lean().exec();
    const meetingsMap = new Map(
      meetingRooms.map((meeting) => [meeting.businessId, meeting._id])
    );
    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const meetingsPoc = [];
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const meetingId = meetingsMap.get(row["Business ID"]?.trim());
        const poc = {
          meeting: meetingId,
          name: row["POC Name"]?.trim(),
          pocDesignation: row["POC Designation"]?.trim(),
          email: row["Email"]?.trim()?.toLowerCase(),
          phoneNumber: row["Phone Number"]?.trim(),
          linkedInProfile: row["LinkedIn Profile"]?.trim(),
          languages: row["Languages"]
            ? row["Languages"].split(",").map((lang) => lang.trim())
            : [],
          address: row["Address"]?.trim(),
          availabilityTime: row["Availibility time"]?.trim(),
          notes: row["Notes"]?.trim(),
        };
        meetingsPoc.push(poc);
      })
      .on("data", (row) => {})
      .on("end", async () => {
        try {
          const businessIds = meetingsPoc.map((w) => w.businessId);
          const existing = await MeetingPoc.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = meetingsPoc.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await MeetingPoc.insertMany(toInsert);
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
