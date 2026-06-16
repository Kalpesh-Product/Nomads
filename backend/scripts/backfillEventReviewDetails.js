import mongoose from "mongoose";
import { config } from "dotenv";
import Event from "../models/Event.js";
import EventReview from "../models/EventReview.js";
import StateWiseWeight from "../models/StateWiseWeight.js";

config({ override: true });

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveEvent = async (review) => {
  if (review.event && mongoose.isValidObjectId(review.event)) {
    const event = await Event.findById(review.event)
      .select("_id eventName destination")
      .lean();

    if (event) return event;
  }

  if (review.eventId && mongoose.isValidObjectId(review.eventId)) {
    return Event.findById(review.eventId)
      .select("_id eventName destination")
      .lean();
  }

  return null;
};

const metadataByDestination = new Map();

const resolveDestinationMetadata = async (destination = "") => {
  const destinationKey = destination.trim().toLowerCase();
  if (!destinationKey) return null;

  if (metadataByDestination.has(destinationKey)) {
    return metadataByDestination.get(destinationKey);
  }

  const metadata = await StateWiseWeight.findOne({
    state: { $regex: new RegExp(`^${escapeRegExp(destination)}$`, "i") },
  })
    .select("continent country state")
    .lean();

  metadataByDestination.set(destinationKey, metadata);
  return metadata;
};

const backfillEventReviewDetails = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  await mongoose.connect(process.env.MONGO_URL);

  const reviews = await EventReview.find({})
    .select("_id event eventId name")
    .lean();
  const operations = [];
  let skipped = 0;

  for (const review of reviews) {
    const event = await resolveEvent(review);

    if (!event) {
      skipped += 1;
      continue;
    }

    const destinationMetadata = await resolveDestinationMetadata(
      event.destination || "",
    );

    operations.push({
      updateOne: {
        filter: { _id: review._id },
        update: {
          $set: {
            eventName: event.eventName || "",
            reviewerName: review.name || "",
            continent: destinationMetadata?.continent || "",
            country: destinationMetadata?.country || "",
            state: destinationMetadata?.state || event.destination || "",
          },
        },
      },
    });
  }

  if (!operations.length) {
    console.log(`No event reviews updated. Skipped ${skipped}.`);
    return;
  }

  const result = await EventReview.bulkWrite(operations, { ordered: false });
  console.log(
    `Updated ${result.modifiedCount} event reviews. Skipped ${skipped}.`,
  );
};

backfillEventReviewDetails()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
