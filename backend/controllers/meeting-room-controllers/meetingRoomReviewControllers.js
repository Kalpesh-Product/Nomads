import MeetingRoom from "../../models/Meeting/MeetingRoom.js";
import MeetingReview from "../../models/Meeting/Review.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const bulkInsertMeetingRoomReviews = async (req, res, next) => {
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
    const meetingsReviews = [];
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const meetingId = meetingsMap.get(row["Business ID"]?.trim());
        const meetingReview = {
          meeting: meetingId,
          name: row["Reviewer Name"]?.trim(),
          rating: row["Rating"] ? Number(row["Rating"]) : undefined,
          reviewText: row["Review Text"]?.trim(),
          platform: row["Platform"]?.trim(),
          reviewLink: row["Review Link"]?.trim(),
        };
        meetingsReviews.push(meetingReview);
      })
      .on("end", async () => {
        try {
          const businessIds = meetingsReviews.map((w) => w.businessId);
          const existing = await MeetingReview.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = meetingsReviews.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await MeetingReview.insertMany(toInsert);
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
