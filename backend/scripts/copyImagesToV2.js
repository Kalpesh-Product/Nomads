import mongoose from "mongoose";
import { config } from "dotenv";
import StateWiseWeight from "../models/StateWiseWeight.js";
import StateWiseWeightV2 from "../models/StateWiseWeightV2.js";

config({ override: true });

// One-time copy: reuse V1's already-uploaded S3 image URLs in V2.
// Copies the URL only, never the s3Key, so a later delete/replace in the V2
// admin UI can never remove the S3 object that V1 still displays.
const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  await mongoose.connect(process.env.MONGO_URL);

  const v1Docs = await StateWiseWeight.find({}).select("country state images").lean();
  const v2Docs = await StateWiseWeightV2.find({}).select("country state images").lean();

  const v2ByKey = new Map(
    v2Docs.map((d) => [`${d.country.toLowerCase()}|${d.state.toLowerCase()}`, d]),
  );

  let copied = 0;
  let skippedAlreadyHasImages = 0;
  let skippedNoV1Images = 0;
  let skippedNoV2Match = 0;
  const operations = [];

  for (const v1 of v1Docs) {
    const key = `${v1.country.toLowerCase()}|${v1.state.toLowerCase()}`;
    const v2 = v2ByKey.get(key);

    if (!v2) {
      skippedNoV2Match += 1;
      continue;
    }

    const v1Images = v1.images instanceof Map ? Object.fromEntries(v1.images) : v1.images || {};
    const urls = Object.values(v1Images)
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean);

    if (!urls.length) {
      skippedNoV1Images += 1;
      continue;
    }

    const v2Images = v2.images instanceof Map ? Object.fromEntries(v2.images) : v2.images || {};
    if (Object.keys(v2Images).length > 0) {
      skippedAlreadyHasImages += 1;
      continue;
    }

    const normalizedState = String(v2.state || "state")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || "STATE";

    const newImages = {};
    urls.slice(0, 5).forEach((url, index) => {
      const slotKey = `${normalizedState}_img${String(index + 1).padStart(2, "0")}`;
      newImages[slotKey] = { url, s3Key: "" };
    });

    operations.push({
      updateOne: {
        filter: { _id: v2._id },
        update: { $set: { images: newImages } },
      },
    });
    copied += 1;
  }

  let result = { matchedCount: 0, modifiedCount: 0 };
  if (operations.length) {
    result = await StateWiseWeightV2.bulkWrite(operations, { ordered: false });
  }

  console.log("--- Copy Images V1 -> V2 Summary ---");
  console.log(`V1 destinations: ${v1Docs.length}`);
  console.log(`Copied: ${copied}`);
  console.log(`Skipped (V2 already had images): ${skippedAlreadyHasImages}`);
  console.log(`Skipped (V1 had no images): ${skippedNoV1Images}`);
  console.log(`Skipped (no matching V2 destination): ${skippedNoV2Match}`);
  console.log(`Mongo: matched=${result.matchedCount} modified=${result.modifiedCount}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
