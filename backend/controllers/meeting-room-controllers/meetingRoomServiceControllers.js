import MeetingRoom from "../../models/Meeting/MeetingRoom.js";
import MeetingService from "../../models/Meeting/Services.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const bulkInsertMeetingRoomServices = async (req, res, next) => {
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
    const meetingsServices = [];
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const meetingId = meetingsMap.get(row["Business Id"]?.trim());
        const meetingService = {
          meeting: meetingId,
          hotDesk: row["Hot Desk"]?.trim()?.toLowerCase() === "yes",
          dedicatedDesk: row["Dedicated Desk"]?.trim()?.toLowerCase() === "yes",
          privateCabin:
            row["Private Cabin/Office"]?.trim()?.toLowerCase() === "yes",
          meetingRoom: row["Meeting Room"]?.trim()?.toLowerCase() === "yes",
          conferenceRoom:
            row["Conference Room"]?.trim()?.toLowerCase() === "yes",
          openDeskArea: row["Open Desk Area"]?.trim()?.toLowerCase() === "yes",
          executiveSuite:
            row["Executive Suite"]?.trim()?.toLowerCase() === "yes",
          virtualOffice: row["Virtual Office"]?.trim()?.toLowerCase() === "yes",
          eventSpace: row["Event Space"]?.trim()?.toLowerCase() === "yes",
          phoneBooth:
            row["Phone Booth/Call Room"]?.trim()?.toLowerCase() === "yes",
          loungeArea: row["Lounge Area"]?.trim()?.toLowerCase() === "yes",
          outdoorWorkspace:
            row["Outdoor Workspace"]?.trim()?.toLowerCase() === "yes",
          dayPass: row["Day Pass"]?.trim()?.toLowerCase() === "yes",
          focusZone: row["Focus Zone"]?.trim()?.toLowerCase() === "yes",
          auditorium: row["Auditorium"]?.trim()?.toLowerCase() === "yes",
          trainingRoom: row["Training Room"]?.trim()?.toLowerCase() === "yes",
        };
        meetingsServices.push(meetingService);
      })
      .on("end", async () => {
        try {
          const businessIds = meetingsServices.map((w) => w.businessId);
          const existing = await MeetingService.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = meetingsServices.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await MeetingService.insertMany(toInsert);
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
