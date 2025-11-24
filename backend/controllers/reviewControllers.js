import Review from "../models/Reviews.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import Company from "../models/Company.js";
import TestReview from "../models/TestReview.js";

export const bulkInsertReviews = async (req, res, next) => {
  try {
    const file = req.file;

    console.log("review test hit1");
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const companies = await Company.find().lean();
    const companyMap = new Map(
      companies.map((item) => [item.businessId?.trim(), item._id])
    );

    const companyIdMap = new Map();
    const companyNameMap = new Map(); // To get company names for logging
    companies.map((company) => {
      companyIdMap.set(company.businessId, company.companyId);
      companyNameMap.set(company.businessId, company.companyName);
    });

    // Fetch existing reviews to check for duplicates
    const existingReviews = await Review.find().select("name company");
    const existingReviewSet = new Set(
      existingReviews.map(
        (review) =>
          `${review.name?.trim().toLowerCase()}|${review.company?.toString()}`
      )
    );

    const reviews = [];
    const seenInCSV = new Set();
    let skippedExisting = 0;
    let skippedDuplicateInCSV = 0;
    const missingCompanyRows = [];
    const duplicateExistingLogs = [];
    const duplicateCSVLogs = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const companyMongoId = companyMap.get(businessId);
        const companyId = companyIdMap.get(businessId);
        const companyName = companyNameMap.get(businessId);
        const reviewerName = row["Reviewer Name"]?.trim();

        if (!companyMongoId) {
          missingCompanyRows.push({
            businessId,
            reviewerName,
            reason: "Invalid Business ID - Company not found",
          });
          console.log(
            `❌ Missing Company - Business ID: "${businessId}", Reviewer: "${reviewerName}"`
          );
          return;
        }

        if (!reviewerName || !companyMongoId) {
          return;
        }

        // Create unique key for this review (name + company ObjectId)
        const reviewKey = `${reviewerName.toLowerCase()}|${companyMongoId.toString()}`;

        // Check if this review already exists in DB
        if (existingReviewSet.has(reviewKey)) {
          skippedExisting++;
          duplicateExistingLogs.push({
            reviewerName,
            companyName,
            companyId,
            reason: "Already exists in database",
          });
          console.log(
            `⚠️ Skipped (Exists in DB) - Reviewer: "${reviewerName}", Company: "${companyName}" (${companyId})`
          );
          return;
        }

        // Check for duplicates within the CSV
        if (seenInCSV.has(reviewKey)) {
          skippedDuplicateInCSV++;
          duplicateCSVLogs.push({
            reviewerName,
            companyName,
            companyId,
            reason: "Duplicate within CSV",
          });
          console.log(
            `⚠️ Skipped (Duplicate in CSV) - Reviewer: "${reviewerName}", Company: "${companyName}" (${companyId})`
          );
          return;
        }

        const formattedReviews = {
          company: companyMongoId,
          companyId,
          name: reviewerName,
          starCount: parseInt(row["Rating"]?.trim()) || 0,
          description: row["Review Text"]?.trim(),
          reviewSource: row["Platform"]?.trim(),
          reviewLink: row["Review Link"]?.trim(),
        };

        seenInCSV.add(reviewKey);
        reviews.push(formattedReviews);
      })
      .on("end", async () => {
        // Log summary of duplicates
        console.log("\n📊 REVIEW SUMMARY:");
        console.log(`Total skipped (existing in DB): ${skippedExisting}`);
        console.log(
          `Total skipped (duplicate in CSV): ${skippedDuplicateInCSV}`
        );
        console.log(`Total missing companies: ${missingCompanyRows.length}`);
        console.log(`Total to be inserted: ${reviews.length}`);

        if (missingCompanyRows.length > 0) {
          console.log("\n❌ Missing Companies:");
          missingCompanyRows.forEach((log, index) => {
            console.log(
              `${index + 1}. Business ID: "${log.businessId}", Reviewer: "${
                log.reviewerName
              }"`
            );
          });
        }

        if (duplicateExistingLogs.length > 0) {
          console.log("\n🔍 Reviews already in database:");
          duplicateExistingLogs.forEach((log, index) => {
            console.log(
              `${index + 1}. Reviewer: "${log.reviewerName}", Company: "${
                log.companyName
              }" (${log.companyId})`
            );
          });
        }

        if (duplicateCSVLogs.length > 0) {
          console.log("\n🔍 Duplicate reviews within CSV:");
          duplicateCSVLogs.forEach((log, index) => {
            console.log(
              `${index + 1}. Reviewer: "${log.reviewerName}", Company: "${
                log.companyName
              }" (${log.companyId})`
            );
          });
        }

        if (reviews.length === 0) {
          return res.status(400).json({
            message:
              "No valid review data found in CSV.\nCheck if the entries are already uploaded.",
            skippedExisting,
            duplicateExistingLogs,
            skippedDuplicateInCSV,
            duplicateCSVLogs,
            missingCompanyCount: missingCompanyRows.length,
            missingCompanyRows,
          });
        }

        try {
          const result = await Review.insertMany(reviews);
          const insertedCount = result.length;

          res.status(200).json({
            message: "Bulk insert completed successfully",
            total:
              reviews.length +
              skippedExisting +
              skippedDuplicateInCSV +
              missingCompanyRows.length,
            inserted: insertedCount,
            skippedExisting,
            duplicateExistingLogs,
            skippedDuplicateInCSV,
            duplicateCSVLogs,
            missingCompanyCount: missingCompanyRows.length,
            missingCompanyRows,
          });
        } catch (insertError) {
          if (insertError.name === "BulkWriteError") {
            const insertedCount = insertError.result?.nInserted || 0;

            res.status(200).json({
              message: "Bulk insert completed with partial failure",
              total: reviews.length,
              inserted: insertedCount,
              skippedExisting,
              duplicateExistingLogs,
              skippedDuplicateInCSV,
              duplicateCSVLogs,
              missingCompanyCount: missingCompanyRows.length,
              missingCompanyRows,
              writeErrors: insertError.writeErrors?.map((e) => ({
                index: e.index,
                errmsg: e.errmsg,
                code: e.code,
              })),
            });
          } else {
            res.status(500).json({
              message: "Unexpected error during bulk insert",
              error: insertError.message,
            });
          }
        }
      });
  } catch (error) {
    next(error);
  }
};
