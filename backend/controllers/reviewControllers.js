import Review from "../models/coworking/Review.js";
import * as yup from "yup";
import { Readable } from "stream";
import csvParser from "csv-parser";
import CoworkingCompany from "../models/coworking/CoworkingCompany.js";

export const addReview = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      coworkingCompany: yup.string().required("Please provide the company object ID"),
      name: yup
        .string()
        .min(1, "Please provide the reviewer's name")
        .required("Please provide the reviewer's name"),
      starCount: yup
        .number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .required("Please provide a star rating"),
      description: yup.string().nullable(),
      reviewSource: yup.string().nullable(),
    });

    const validatedData = await schema.validate(req.body, {
      abortEarly: false,
    });

    const newReview = new Review(validatedData);
    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reveiws = await Review.find({ company: req.params.companyId })
      .lean()
      .exec();
    if (!reveiws?.length) {
      return res
        .status(404)
        .json({ message: "No reviews added for this company yet" });
    }
    return res.status(200).json(reveiws);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertReviews = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    const companies = await CoworkingCompany.find().lean().exec();
    const companyMap = new Map(
      companies.map((company) => [company.businessId, company._id.toString()])
    );
    const reviews = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const formattedReviews = {
          coworkingCompany: companyMap.get(row["Business ID"]?.trim()),
          name: row["Reviewer Name"]?.trim(),
          starCount: parseInt(row["Rating"]?.trim()),
          description: row["Review Text"]?.trim(),
        };
        reviews.push(formattedReviews);
      })
      .on("end", async () => {
        try {
          const result = await Review.insertMany(reviews);
          const insertedCount = result.length;
          const failedCount = reviews.length - insertedCount;
          res.status(200).json({
            message: "Bulk insert completed with partial success",
            total: reviews.length,
            inserted: insertedCount,
            failed: failedCount,
          });
        } catch (insertError) {
          if (insertError.name === "BulkWriteError") {
            const insertedCount = insertError.result?.nInserted || 0;
            const failedCount = reviews.length - insertedCount;

            res.status(200).json({
              message: "Bulk insert completed with partial failure",
              total: reviews.length,
              inserted: insertedCount,
              failed: failedCount,
              writeErrors: insertError.writeErrors?.map((e) => ({
                index: e.index,
                errmsg: e.errmsg,
                code: e.code,
                op: e.op,
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
