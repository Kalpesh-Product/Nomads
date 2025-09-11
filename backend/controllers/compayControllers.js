import Company from "../models/Company.js";
import Review from "../models/Reviews.js";
import PointOfContact from "../models/PointOfContact.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { uploadFileToS3 } from "../config/s3Config.js";
import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import axios from "axios";

export const bulkInsertCompanies = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const companies = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const company = {
          businessId: row["Business ID"]?.trim(),
          companyName: row["Business Name"]?.trim(),
          registeredEntityName: row["Registered Entity name"]?.trim(),
          website: row["Website"]?.trim() || null,
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          state: row["State"]?.trim(),
          country: row["Country"]?.trim(),
          about: row["About"]?.trim(),
          totalSeats: parseInt(row["Total Seats"]?.trim()) || null,
          latitude: parseFloat(row["latitude"]?.trim()),
          longitude: parseFloat(row["longitude"]?.trim()),
          googleMap: row["Google map"]?.trim() || null,
          ratings: parseFloat(row["Ratings"]) || 0,
          totalReviews: parseInt(row["Total Reviews"]?.trim()) || 0,
          inclusions: row["Inclusions"]?.trim(),
          services: row["Services"]?.trim(),
          units: row["Units"]?.trim(),
          companyType: row["Type"]?.trim()?.split(" ").length
            ? row["Type"]?.trim()?.split(" ").join("").toLowerCase()
            : row["Type"]?.trim()?.toLowerCase(),
        };
        companies.push(company);
      })
      .on("end", async () => {
        try {
          const result = await Company.insertMany(companies);

          const insertedCount = result.length;
          const failedCount = companies.length - insertedCount;

          res.status(200).json({
            message: "Bulk insert completed",
            total: companies.length,
            inserted: insertedCount,
            failed: failedCount,
          });
        } catch (insertError) {
          if (insertError.name === "BulkWriteError") {
            const insertedCount = insertError.result?.nInserted || 0;
            const failedCount = companies.length - insertedCount;

            res.status(200).json({
              message: "Bulk insert completed with partial failure",
              total: companies.length,
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
    console.log(error);
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const {
      businessId,
      companyName,
      registeredEntityName,
      website,
      address,
      city,
      state,
      country,
      about,
      totalSeats,
      latitude,
      longitude,
      googleMap,
      ratings,
      totalReviews,
      inclusions,
      services,
      units,
      companyType,
      poc, // single POC object
      reviews, // array of reviews
    } = req.body;

    if (!businessId || !companyName) {
      return res
        .status(400)
        .json({ message: "Business ID and Company Name are required" });
    }

    // Create company
    const company = new Company({
      businessId: businessId.trim(),
      companyName: companyName.trim(),
      registeredEntityName: registeredEntityName?.trim(),
      website: website?.trim() || null,
      address: address?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      country: country?.trim(),
      about: about?.trim(),
      totalSeats: totalSeats ? parseInt(totalSeats) : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      googleMap: googleMap?.trim() || null,
      ratings: ratings ? parseFloat(ratings) : 0,
      totalReviews: totalReviews ? parseInt(totalReviews) : 0,
      inclusions: inclusions?.trim(),
      services: services?.trim(),
      units: units?.trim(),
      companyType: companyType?.trim()?.split(" ").join("").toLowerCase(),
    });

    // Save company first (needed for _id reference in POC/Reviews)
    const savedCompany = await company.save();

    /** ---------------- IMAGE UPLOAD LOGIC ---------------- **/

    const formatCompanyType = (type) => {
      const map = {
        hostel: "hostels",
        privatestay: "private-stay",
        meetingroom: "meetingroom",
        coworking: "coworking",
        cafe: "cafe",
        coliving: "coliving",
        workation: "workation",
      };
      const key = String(type || "").toLowerCase();
      return map[key] || "unknown";
    };

    const pathCompanyType = formatCompanyType(
      companyType || savedCompany.companyType
    );

    const safeCompanyName =
      (companyName || "unnamed").replace(/[^\w\- ]+/g, "").trim() || "unnamed";

    const folderPath = `nomads/${pathCompanyType}/${country}/${safeCompanyName}`;

    // 1️⃣ Upload Logo if provided (req.files.logo)
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      const logoKey = `${folderPath}/logo/${logoFile.originalname}`;
      const logoUrl = await uploadFileToS3(logoKey, logoFile);
      savedCompany.logo = logoUrl;
    }

    // 2️⃣ Upload Images if provided (req.files.images[])
    if (req.files?.images && req.files.images.length > 0) {
      if (!Array.isArray(savedCompany.images)) savedCompany.images = [];
      const startIndex = savedCompany.images.length;

      const sanitizeFileName = (name) =>
        String(name || "file")
          .replace(/[/\\?%*:|"<>]/g, "_")
          .replace(/\s+/g, "_");

      const results = await Promise.allSettled(
        req.files.images.map(async (file, i) => {
          const uniqueKey = `${folderPath}/images/${sanitizeFileName(
            file.originalname
          )}`;
          const uploadedUrl = await uploadFileToS3(uniqueKey, file);
          return {
            url: uploadedUrl,
            index: startIndex + i + 1,
          };
        })
      );

      const successes = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      if (successes.length) {
        savedCompany.images.push(...successes);
      }
    }

    // Save company again with logo/images
    await savedCompany.save({ validateBeforeSave: false });

    /** ---------------- POC LOGIC ---------------- **/
    if (poc && Object.keys(poc).length > 0) {
      const pocDoc = new PointOfContact({
        company: savedCompany._id,
        name: poc.name?.trim(),
        image: poc.image?.trim(),
        designation: poc.designation?.trim(),
        email: poc.email?.trim()?.toLowerCase(),
        phoneNumber: poc.phoneNumber?.trim(),
        linkedInProfile: poc.linkedInProfile?.trim(),
        languages: Array.isArray(poc.languages)
          ? poc.languages.map((lang) => lang.trim())
          : poc.languages?.split(",").map((lang) => lang.trim()),
        address: poc.address?.trim(),
        availabilityTime: poc.availabilityTime?.trim(),
      });
      await pocDoc.save();
    }

    /** ---------------- REVIEWS LOGIC ---------------- **/
    if (Array.isArray(reviews) && reviews.length > 0) {
      const reviewDocs = reviews.map((review) => ({
        company: savedCompany._id,
        name: review.name?.trim(),
        starCount: parseInt(review.starCount),
        description: review.description?.trim(),
        reviewSource: review.reviewSource?.trim(),
        reviewLink: review.reviewLink?.trim(),
      }));
      await Review.insertMany(reviewDocs);
    }

    res.status(201).json({
      message: "Company created successfully with images",
      company: savedCompany,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getCompaniesData = async (req, res, next) => {
  try {
    const companies = await Company.find().lean().exec();
    const reviews = await Review.find().lean().exec();
    const poc = await PointOfContact.find().lean().exec();

    const { country, state, type } = req.query;

    // Base company dataset with reviews and active POC
    const enrichCompanies = (base) => {
      return base.map((company) => ({
        ...company,
        reviews: reviews.filter(
          (review) => review.company.toString() === company._id.toString()
        ),
        poc: poc
          .filter((p) => p.company._id.toString() === company._id.toString())
          .find((p) => p.isActive),
      }));
    };

    let filteredCompanies = [];

    // 1. Filter by all three: type + country + state
    if (type && country && state) {
      filteredCompanies = companies.filter(
        (company) =>
          company.companyType === type?.toLowerCase() &&
          company.country?.toLowerCase() === country.toLowerCase() &&
          company.state?.toLowerCase() === state.toLowerCase()
      );
    }
    // 2. Filter only by type
    else if (type) {
      filteredCompanies = companies.filter(
        (company) => company.companyType === type
      );
    }
    // 3. Filter only by country and state
    else if (country && state) {
      filteredCompanies = companies.filter(
        (company) =>
          company.country?.toLowerCase() === country.toLowerCase() &&
          company.state?.toLowerCase() === state.toLowerCase()
      );
    }
    // 4. No filters → all companies
    else {
      filteredCompanies = companies;
    }

    const companyData = enrichCompanies(filteredCompanies);

    res.status(200).json(companyData);
  } catch (error) {
    next(error);
  }
};

export const getCompanyData = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    let companyQuery;
    if (mongoose.Types.ObjectId.isValid(companyId)) {
      // Search by ObjectId
      companyQuery = Company.findById(companyId).lean().exec();
    } else {
      // Search by companyName (case-insensitive regex)
      companyQuery = Company.findOne({
        companyName: { $regex: new RegExp(`^${companyId}$`, "i") },
      })
        .lean()
        .exec();
    }

    const companyData = await companyQuery;

    if (!companyData) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Use the actual ObjectId of the found company
    const companyObjectId = companyData._id;

    const nearbyRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: "15.4909,73.8278", // Panaji (center of Goa)
          radius: 5000,
          keyword: "coworking space",
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    const coworkingSpaces = nearbyRes.data.results || [];

    // Step 2: For each space, fetch reviews from Place Details API
    const detailedSpaces = await Promise.all(
      coworkingSpaces.map(async (place) => {
        try {
          const detailsRes = await axios.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            {
              params: {
                place_id: place.place_id,
                key: process.env.GOOGLE_PLACES_API_KEY,
                // ✅ include geometry so details.geometry is available if needed
                fields:
                  "name,rating,user_ratings_total,reviews,formatted_address,geometry",
              },
            }
          );

          const details = detailsRes.data.result || {};

          // Use lat/lng from Nearby first; fall back to Details if missing
          const nearbyLoc = place.geometry?.location;
          const detailsLoc = details.geometry?.location;
          const location = nearbyLoc || detailsLoc || null;

          // Top 5 five-star reviews (from the 0–5 reviews Google returns)
          const reviews = (details.reviews || [])
            .filter((r) => r.rating === 5)
            .slice(0, 5);

          return {
            place_id: place.place_id,
            name: details.name ?? place.name,
            address: details.formatted_address ?? place.vicinity ?? "",
            rating: details.rating ?? place.rating ?? null,
            user_ratings_total:
              details.user_ratings_total ?? place.user_ratings_total ?? 0,
            location, // { lat, lng } or null
            reviews,
          };
        } catch (err) {
          // On details failure, still return basic info + location from Nearby
          return {
            place_id: place.place_id,
            name: place.name,
            address: place.vicinity ?? "",
            rating: place.rating ?? null,
            user_ratings_total: place.user_ratings_total ?? 0,
            location: place.geometry?.location ?? null,
            reviews: [],
          };
        }
      })
    );

    const filteredDetails = detailedSpaces.find((data) => {
      function toTruncate(num, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.trunc(num * factor) / factor;
      }

      const googleLat = toTruncate(data.location.lat, 3);
      const googleLong = toTruncate(data.location.lng, 3);
      const companyLat = toTruncate(companyData.latitude, 3);
      const companyLong = toTruncate(companyData.longitude, 3);

      return companyLat === googleLat && companyLong === googleLong;
    });

    // const companyReviews = filteredDetails?.reviews.map((review) => ({
    //   company: companyData._id,
    //   name: review.author_name,
    //   starCount: review.rating,
    //   description: review.text,
    //   reviewLink: review.author_url,
    //   avatar: review.profile_photo_url,
    // }));

    const [reviews, poc] = await Promise.all([
      Review.find({ company: companyObjectId }).lean().exec(),
      PointOfContact.findOne({ company: companyObjectId, isActive: true })
        .lean()
        .exec(),
    ]);

    const updatedCompanyData = {
      ...companyData,
      ratings: filteredDetails?.rating,
      totalReviews: filteredDetails?.user_ratings_total,
    };

    return res.status(200).json({
      ...updatedCompanyData,
      reviews,
      poc,
    });
  } catch (error) {
    console.error("getCompanyData error:", error);
    next(error);
  }
};

export const getGlobalListings = async (req, res, next) => {
  const categoryKeywordMap = {
    coworking: "coworking space",
    hostel: "hostel",
    workation: "resort",
    privatestay: "vacation rental",
    meetingroom: "meeting room",
    cafe: "cafe",
  };

  try {
    const { country, state } = req.query;

    // For now, hardcode Goa center (later geocode country+state → lat/lng)
    const center = { lat: 15.4909, lng: 73.8278 };

    const allResults = [];

    await Promise.all(
      Object.entries(categoryKeywordMap).map(async ([key, keyword]) => {
        const nearbyRes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
          {
            params: {
              location: `${center.lat},${center.lng}`,
              radius: 5000,
              keyword,
              key: process.env.GOOGLE_PLACES_API_KEY,
            },
          }
        );

        const detailedSpaces = await Promise.all(
          (nearbyRes.data.results || []).map(async (place) => {
            try {
              const detailsRes = await axios.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                {
                  params: {
                    place_id: place.place_id,
                    key: process.env.GOOGLE_PLACES_API_KEY,
                    fields:
                      "name,rating,user_ratings_total,reviews,formatted_address,geometry",
                  },
                }
              );
              const details = detailsRes.data.result || {};

              return {
                id: place.place_id,
                name: details.name ?? place.name,
                address: details.formatted_address ?? place.vicinity,
                rating: details.rating ?? place.rating,
                totalReviews:
                  details.user_ratings_total ?? place.user_ratings_total,
                location: details.geometry?.location ?? place.geometry?.location,
                reviews: details.reviews || [],
                type: key, // ✅ flatten category into type
              };
            } catch {
              return {
                id: place.place_id,
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                totalReviews: place.user_ratings_total,
                location: place.geometry?.location,
                reviews: [],
                type: key, // ✅ flatten category into type
              };
            }
          })
        );

        allResults.push(...detailedSpaces);
      })
    );

    res.status(200).json(allResults);
  } catch (err) {
    console.error("getGlobalListings error:", err);
    next(err);
  }
};



export const getCompany = async (req, res, next) => {
  try {
    const { companyName } = req.params;
    const company = await Company.findOne({ companyName });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

export const getUniqueDataLocations = async (req, res, next) => {
  try {
    const companies = await Company.find().lean().exec();

    const countryMap = new Map();

    for (const company of companies) {
      const country = company.country;
      const state = company.state;

      if (!countryMap.has(country)) {
        countryMap.set(country, new Set()); // use Set for unique states
      }
      countryMap.get(country).add(state);
    }

    const finalizedLocations = Array.from(countryMap.entries()).map(
      ([country, statesSet]) => ({
        country,
        states: Array.from(statesSet), // convert Set to array
      })
    );

    return res.status(200).json(finalizedLocations);
  } catch (error) {
    next(error);
  }
};

export const addCompanyImage = async (req, res, next) => {
  try {
    const file = req.file;
    const { type = "", companyId, businessId, companyType = "" } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const normalizedType = String(type).toLowerCase();
    if (!["logo", "image", "images"].includes(normalizedType)) {
      return res
        .status(400)
        .json({ message: "Invalid type. Use 'logo' or 'image'." });
    }

    let company;
    if (companyId) {
      company = await Company.findById(companyId).exec();
    } else if (businessId) {
      company = await Company.findOne({ businessId }).exec();
    } else {
      return res
        .status(400)
        .json({ message: "Provide companyId or businessId" });
    }

    if (!company) {
      return res.status(404).json({ message: "No such company found" });
    }

    if (
      companyType &&
      company.companyType?.toLowerCase() !== companyType.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ message: "companyType does not match the stored company" });
    }

    const formatCompanyType = (type) => {
      const map = {
        hostel: "hostels",
        privatestay: "private-stay",
        meetingroom: "meetingroom",
        coworking: "coworking",
        cafe: "cafe",
        coliving: "coliving",
        workation: "workation",
      };

      const key = String(type || "").toLowerCase();
      return map[key] || "unknown";
    };

    const folderType = normalizedType === "logo" ? "logo" : "images";
    const pathCompanyType = formatCompanyType(
      companyType || company.companyType
    );

    const safeCompanyName =
      (company.companyName || "unnamed").replace(/[^\w\- ]+/g, "").trim() ||
      "unnamed";

    const folderPath = `nomads/${pathCompanyType}/${company.country}/${safeCompanyName}`;
    const s3Key = `${folderPath}/${folderType}/${file.originalname}`;

    let uploadedUrl;
    try {
      uploadedUrl = await uploadFileToS3(s3Key, file);
    } catch (err) {
      return res.status(500).json({ message: "Failed to upload image to S3" });
    }

    if (folderType === "logo") {
      company.logo = uploadedUrl;
    } else {
      if (!Array.isArray(company.images)) company.images = [];
      company.images.push({
        url: uploadedUrl,
        index: company.images.length + 1,
      });
    }

    await company.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: `Successfully uploaded ${pathCompanyType} company ${folderType}`,
      data: {
        companyId: company._id,
        businessId: company.businessId,
        type: folderType,
        url: uploadedUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addCompanyImagesBulk = async (req, res, next) => {
  try {
    const files = req.files;
    const { companyId, businessId, companyType = "" } = req.body;

    if (!files || !files.length) {
      return res.status(400).json({ message: "No files provided" });
    }

    let company;
    if (companyId) {
      company = await Company.findById(companyId).exec();
    } else if (businessId) {
      company = await Company.findOne({ businessId }).exec();
    } else {
      return res
        .status(400)
        .json({ message: "Provide companyId or businessId" });
    }

    if (!company) {
      return res.status(404).json({ message: "No such company found" });
    }

    if (
      companyType &&
      company.companyType?.toLowerCase() !== String(companyType).toLowerCase()
    ) {
      return res
        .status(400)
        .json({ message: "companyType does not match the stored company" });
    }

    const formatCompanyType = (type) => {
      const map = {
        hostel: "hostels",
        privatestay: "private-stay",
        meetingroom: "meetingroom",
        coworking: "coworking",
        cafe: "cafe",
        coliving: "coliving",
        workation: "workation",
      };
      const key = String(type || "").toLowerCase();
      return map[key] || "unknown";
    };

    const pathCompanyType = formatCompanyType(
      companyType || company.companyType
    );

    const safeCompanyName =
      (company.companyName || "unnamed").replace(/[^\w\- ]+/g, "").trim() ||
      "unnamed";

    const folderPath = `nomads/${pathCompanyType}/${company.country}/${safeCompanyName}`;
    const folderType = "images";

    if (!Array.isArray(company.images)) company.images = [];
    const startIndex = company.images.length;

    const sanitizeFileName = (name) =>
      String(name || "file")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/\s+/g, "_");

    const results = await Promise.allSettled(
      files.map(async (file, i) => {
        const uniqueKey = `${folderPath}/${folderType}/${sanitizeFileName(
          file.originalname
        )}`;
        const uploadedUrl = await uploadFileToS3(uniqueKey, file);
        return {
          url: uploadedUrl,
          index: startIndex + i + 1,
          originalName: file.originalname,
          key: uniqueKey,
        };
      })
    );

    // Split successes and failures
    const successes = [];
    const failures = [];

    for (const r of results) {
      if (r.status === "fulfilled") successes.push(r.value);
      else failures.push({ reason: r.reason?.message || "Unknown error" });
    }

    // Append successful uploads to the company doc
    if (successes.length) {
      company.images.push(
        ...successes.map((s) => ({ url: s.url, index: s.index }))
      );
      // Skip validators to avoid tripping on unrelated fields
      await company.save({ validateBeforeSave: false });
    }

    return res.status(failures.length ? 207 : 200).json({
      message:
        failures.length && successes.length
          ? `Uploaded ${successes.length} images; ${failures.length} failed`
          : failures.length
          ? "All uploads failed"
          : `Successfully uploaded ${successes.length} images`,
      data: {
        companyId: company._id,
        businessId: company.businessId,
        type: folderType,
        uploaded: successes,
        failed: failures,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const editCompany = async (req, res, next) => {
  try {
    const { companyName, link } = req.body;

    const company = await Company.findOneAndUpdate(
      { companyName },
      { websiteTemplateLink: link }
    );

    if (!company) {
      return res.status(400).json({
        message:
          "Failed to add website template link.Check if the company exists.",
      });
    }

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

export const getAllLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find();

    if (!leads || !leads.length) {
      return res.status(400).json({
        message: "No leads found",
      });
    }

    return res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};

export const getCompanyLeads = async (req, res, next) => {
  try {
    const { companyId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: "Invalid id provided",
      });
    }

    const leads = await Lead.find({ companyId: companyId });

    if (!leads || !leads.length) {
      return res.status(400).json({
        message: "No leads found",
      });
    }

    return res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};
