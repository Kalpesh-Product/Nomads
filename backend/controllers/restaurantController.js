import { randomUUID } from "node:crypto";
import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import RestaurantReview from "../models/RestaurantReview.js";
import { deleteFileFromS3ByKey, listS3FolderObjects, uploadFileToS3 } from "../config/s3Config.js";

const REQUIRED_COLUMNS = [
  "Business ID",
  "Business Name",
  "Continent",
  "Country",
  "State",
  "City",
  "Type",
];

const RESTAURANT_FIELDS = [
  "businessId",
  "restaurantId",
  "businessName",
  "mainImage",
  "logo",
  "images",
  "restaurantName",
  "restaurantTitle",
  "registeredEntityName",
  "website",
  "shortDescription",
  "address",
  "continent",
  "country",
  "state",
  "city",
  "about",
  "totalSeats",
  "latitude",
  "longitude",
  "googleMap",
  "googleMapsLink",
  "ratings",
  "rating",
  "totalReviews",
  "reviews",
  "poc",
  "inclusions",
  "services",
  "units",
  "destination",
  "restaurantType",
];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const buildSectionsFromPayload = (sections) => {
  if (!Array.isArray(sections)) return [];

  return sections.map((section = {}) => ({
    title: normalizeString(section.title) || "",
    image: normalizeString(section.image) || "",
    content: normalizeString(section.content) || "",
  }));
};

const buildRestaurantPayload = (body, { partial = false } = {}) => {
  const payload = {};

  const bodyWithAliases = { ...body };

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessName")
  ) {
    bodyWithAliases.restaurantName = bodyWithAliases.businessName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessName") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName")
  ) {
    bodyWithAliases.businessName = bodyWithAliases.restaurantName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantTitle") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName")
  ) {
    bodyWithAliases.restaurantTitle = bodyWithAliases.restaurantName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantId") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessId")
  ) {
    bodyWithAliases.restaurantId = bodyWithAliases.businessId;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "destination") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "state")
  ) {
    bodyWithAliases.destination = bodyWithAliases.state;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantType") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "placeType")
  ) {
    bodyWithAliases.restaurantType = bodyWithAliases.placeType;
  }

  for (const field of RESTAURANT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(bodyWithAliases, field)) continue;

    payload[field] =
      field === "sections"
        ? buildSectionsFromPayload(bodyWithAliases[field])
        : normalizeString(bodyWithAliases[field]);
  }

  return payload;
};

const validateRequiredRestaurantFields = (payload) => {
  const missingFields = [
    "businessId",
    "restaurantId",
    "businessName",
    "restaurantName",
    "restaurantTitle",
    "continent",
    "country",
    "state",
    "city",
    "destination",
    "restaurantType",
  ].filter(
    (field) => !payload[field],
  );

  return missingFields;
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DASH_VARIANTS = /[-\u2010-\u2015\u2212\uFE63\uFF0D]/u;
const DASH_VARIANT_PATTERN = [
  "[-",
  String.fromCodePoint(0x2010),
  "-",
  String.fromCodePoint(0x2015, 0x2212, 0xfe63, 0xff0d),
  "]",
].join("");

const buildExactDestinationPattern = (destination) =>
  destination
    .split(DASH_VARIANTS)
    .map(escapeRegex)
    .join(DASH_VARIANT_PATTERN);

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/\uFEFF/g, "").trim(),
      typeof value === "string" ? value.trim() : value,
    ]),
  );

const buildSections = (row) => {
  const sections = [];

  for (let i = 1; i <= 20; i++) {
    const title = row[`Section ${i} Title`];
    const image = row[`Section ${i} Image`];
    const content = row[`Section ${i} Content`];

    if (title || image || content) {
      sections.push({
        title: title || "",
        image: image || "",
        content: content || "",
      });
    }
  }

  return sections;
};

const parseNumber = (value) => {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildRestaurant = (row) => ({
  businessId: row["Business ID"],
  restaurantId: row["Business ID"],
  businessName: row["Business Name"],
  restaurantName: row["Business Name"],
  restaurantTitle: row["Business Name"],
  registeredEntityName: row["Registered Entity name"] || "",
  website: row["Website"] || "",
  logo: row["Logo"] || "",
  images: [],
  mainImage: row["Logo"] || "",
  shortDescription: row["About"] || "",
  address: row["Address"] || "",
  continent: row["Continent"],
  country: row["Country"],
  state: row["State"],
  city: row["City"],
  about: row["About"] || "",
  totalSeats: parseNumber(row["Total Seats"]),
  latitude: parseNumber(row["latitude"]),
  longitude: parseNumber(row["longitude"]),
  googleMap: row["Google map"] || "",
  googleMapsLink: row["Google map"] || "",
  ratings: parseNumber(row["Ratings"]),
  rating: row["Ratings"] || "",
  totalReviews: parseNumber(row["Total Reviews"]) || 0,
  reviews: row["Reviews"] || "",
  poc: row["POC"] || "",
  inclusions: row["Inclusions"] || "",
  services: row["Services"] || "",
  units: row["Units"] || "",
  destination: row["Destination"] || row["State"] || row["City"],
  restaurantType: row["Type"] || "",
});

const sanitizeFileName = (name) =>
  String(name || "file")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");

const sanitizeFolderName = (name) =>
  String(name || "unnamed")
    .replace(/[^\w\- ]+/g, "")
    .trim() || "unnamed";

const getExistingRestaurantImages = (images) =>
  Array.isArray(images)
    ? images.filter((image) => image && typeof image === "object")
    : [];

export const addRestaurantImagesBulk = async (req, res, next) => {
  try {
    const files = req.files;
    const { restaurantId, businessId } = req.body || {};

    if (!files || !files.length) {
      return res.status(400).json({ message: "No files provided" });
    }

    let restaurant;
    if (restaurantId) {
      if (!mongoose.isValidObjectId(restaurantId)) {
        return res.status(400).json({
          message: "Valid restaurant identifier is required",
        });
      }
      restaurant = await Restaurant.findById(restaurantId).exec();
    } else if (businessId) {
      restaurant = await Restaurant.findOne({ businessId }).exec();
    } else {
      return res
        .status(400)
        .json({ message: "Provide restaurantId or businessId" });
    }

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const existingImages = getExistingRestaurantImages(restaurant.images);
    if (existingImages.length) {
      return res.status(409).json({
        message:
          "Images already exist. Please use a restaurant reupload flow to replace them.",
      });
    }

    const folderPath = `nomads/restaurants/${restaurant.country}/${sanitizeFolderName(
      restaurant.restaurantName || restaurant.businessName,
    )}`;
    const startIndex = existingImages.length;

    const uploadResults = await Promise.allSettled(
      files.map(async (file, index) => {
        const key = `${folderPath}/images/${sanitizeFileName(
          file.originalname,
        )}`;
        const data = await uploadFileToS3(key, file);
        return {
          url: data.url,
          index: startIndex + index + 1,
          originalName: file.originalname,
          key,
        };
      }),
    );

    const successes = [];
    const failures = [];

    for (const result of uploadResults) {
      if (result.status === "fulfilled") successes.push(result.value);
      else failures.push({ reason: result.reason?.message || "Unknown error" });
    }

    if (successes.length) {
      restaurant.images = successes.map((image) => ({
        url: image.url,
        index: image.index,
      }));
      restaurant.mainImage = successes[0].url;
      await restaurant.save({ validateBeforeSave: false });
    }

    return res.status(failures.length ? 207 : 200).json({
      message:
        failures.length && successes.length
          ? `Uploaded ${successes.length} restaurant images; ${failures.length} failed`
          : failures.length
            ? "All restaurant image uploads failed"
            : `Successfully uploaded ${successes.length} restaurant images`,
      data: {
        restaurantId: restaurant._id,
        businessId: restaurant.businessId,
        uploaded: successes,
        failed: failures,
      },
    });
  } catch (error) {
    next(error);
  }
};

const restaurantMediaFolder = (restaurant, type) =>
  `nomads/restaurants/${restaurant.country}/${sanitizeFolderName(
    restaurant.restaurantName || restaurant.businessName,
  )}/${type}`;

const uploadReplacementMedia = async (key, file, options) => {
  const { url } = await uploadFileToS3(key, file, options);
  return { key, url: `${new URL(url).origin}/${key.split("/").map(encodeURIComponent).join("/")}` };
};

const snapshotUntrackedGalleryPhotos = async (restaurant, folder) => {
  const otherRestaurants = await Restaurant.find(
    { country: restaurant.country, _id: { $ne: restaurant._id } },
    "country restaurantName businessName",
  ).lean();
  // Different restaurant names can sanitize to the same S3 folder.
  if (otherRestaurants.some((other) => restaurantMediaFolder(other, "images") === folder)) {
    return new Map();
  }
  const prefix = `${folder}/`;
  const objects = await listS3FolderObjects(prefix);
  return new Map(
    objects
      .filter(({ Key, ETag }) =>
        ETag && Key?.startsWith(prefix) &&
        !Key.slice(prefix.length).includes("/") && /\.webp$/i.test(Key),
      )
      .map(({ Key, ETag }) => [Key, ETag]),
  );
};

const deleteRestaurantMedia = async (keys, etags = new Map()) => {
  const results = await Promise.allSettled(
    keys.map((key) => deleteFileFromS3ByKey(key, etags.get(key))),
  );
  return results.filter((result) => result.status === "rejected" || !result.value.success).length;
};

const removeSupersededRestaurantMedia = async (restaurant, urls, type, etags = new Map()) => {
  const prefix = `${restaurantMediaFolder(restaurant, type)}/`;
  const oldRetryPrefix = `nomads/restaurants/${restaurant._id}/images/reuploads/`;
  const bucket = escapeRegex(process.env.PROJECT_S3_BUCKET_NAME);
  const endpoint = String.raw`s3(?:[.-](?:dualstack\.)?[a-z0-9-]+)?\.amazonaws\.com`;
  const urlPrefix = `https?://(?:${bucket}\\.${endpoint}|${endpoint}/${bucket})/`;
  const bucketUrl = new RegExp(`^${urlPrefix}`, "i");
  const candidates = new Map();
  const getKeyPaths = (key) => new Set([key, key.split("/").map(encodeURIComponent).join("/")]);
  for (const key of etags.keys()) candidates.set(key, getKeyPaths(key));

  for (const url of urls) {
    if (typeof url !== "string") continue;
    let path;
    let key;
    try {
      const parsed = new URL(url);
      const objectUrl = parsed.origin + parsed.pathname;
      const match = objectUrl.match(bucketUrl);
      if (!match) continue;
      path = objectUrl.slice(match[0].length);
      key = decodeURIComponent(path);
    } catch {
      continue;
    }
    if (!key.startsWith(prefix) && !(type === "images" && key.startsWith(oldRetryPrefix))) continue;

    if (!candidates.has(key)) {
      candidates.set(key, getKeyPaths(key));
    }
    candidates.get(key).add(path);
  }

  const unused = [];
  for (const [key, paths] of candidates) {
    // The same key can be stored under different S3 endpoints or with a query string.
    const keyPaths = [...paths].map(escapeRegex).join("|");
    const reference = { $regex: `^(?i:${urlPrefix})(?:${keyPaths})(?:[?#]|$)` };
    const stillUsed = await Restaurant.exists({
      $or: [
        { "images.url": reference },
        { logo: reference },
        { mainImage: reference },
      ],
    });
    if (!stillUsed) unused.push(key);
  }
  return deleteRestaurantMedia(unused, etags);
};

export const reuploadRestaurantImages = async (req, res, next) => {
  try {
    const { restaurantId } = req.body || {};
    const files = req.files || [];
    if (!mongoose.isValidObjectId(restaurantId) || !files.length) {
      return res.status(400).json({ message: "Select a restaurant and at least one photo." });
    }
    if (files.some((file) => file.mimetype !== "image/webp" || !/\.webp$/i.test(file.originalname))) {
      return res.status(400).json({ message: "Only .webp photos are allowed." });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }
    const previousImages = (restaurant.images || []).filter((image) => image?.url);
    if (!previousImages.length) {
      return res.status(409).json({ message: "Use Bulk Restaurant Images Upload for an empty gallery." });
    }

    const folder = restaurantMediaFolder(restaurant, "images");
    const previousObjects = await snapshotUntrackedGalleryPhotos(restaurant, folder);
    // Stage each batch outside the flat image list so concurrent uploads cannot be swept.
    const batchFolder = `${folder}/reuploads/${randomUUID()}`;
    const results = await Promise.allSettled(
      files.map((file, index) => uploadReplacementMedia(
        `${batchFolder}/${index + 1}-${sanitizeFileName(file.originalname)}`,
        file,
        { createOnly: true },
      )),
    );
    const uploaded = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    const failed = results.flatMap((result, index) => result.status === "rejected" ? [files[index].originalname] : []);
    const newKeys = uploaded.map(({ key }) => key);
    if (failed.length) {
      await deleteRestaurantMedia(newKeys);
      return res.status(502).json({
        message: `Could not upload: ${failed.join(", ")}. The current gallery is intact. Retry the complete replacement set.`,
      });
    }

    const images = uploaded.map(({ url }, index) => ({ url, index: index + 1 }));
    // Check the version so another completed gallery replacement wins over this stale request.
    const version = restaurant.__v ?? { $exists: false };
    const update = await Restaurant.updateOne(
      { _id: restaurantId, __v: version },
      { $set: { images, mainImage: images[0].url }, $inc: { __v: 1 } },
    );
    if (!update.modifiedCount) {
      await deleteRestaurantMedia(newKeys);
      return res.status(409).json({ message: "The gallery changed during upload. Refresh and retry." });
    }

    const cleanupFailed = await removeSupersededRestaurantMedia(
      restaurant,
      previousImages.map(({ url }) => url),
      "images",
      previousObjects,
    ).catch(() => 1);
    return res.status(200).json({
      message: cleanupFailed
        ? `Gallery replaced with ${images.length} photos. Some previous S3 files could not be removed.`
        : `Gallery replaced with ${images.length} photos.`,
      cleanupFailed,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadRestaurantLogo = async (req, res, next) => {
  try {
    const file = req.file;
    const { restaurantId, businessId } = req.body || {};
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return res.status(400).json({ message: "Select a JPG, PNG, or WebP logo." });
    }

    let restaurant;
    if (restaurantId && mongoose.isValidObjectId(restaurantId)) {
      restaurant = await Restaurant.findById(restaurantId).lean();
    } else if (!restaurantId && businessId) {
      restaurant = await Restaurant.findOne({ businessId }).lean();
    } else {
      return res.status(400).json({ message: "Provide a valid restaurant identifier." });
    }
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found on the Nomads backend used for uploads." });
    }

    const folder = restaurantMediaFolder(restaurant, "logo");
    const key = `${folder}/${randomUUID()}/1-${sanitizeFileName(file.originalname)}`;
    const replacement = await uploadReplacementMedia(key, file).catch(() => null);
    if (!replacement) {
      return res.status(502).json({ message: "S3 did not accept the logo. The current logo is intact." });
    }

    const fields = { logo: replacement.url };
    if (!restaurant.images?.some((image) => image?.url) &&
        (!restaurant.mainImage || restaurant.mainImage === restaurant.logo)) {
      fields.mainImage = replacement.url;
    }
    const update = await Restaurant.updateOne(
      { _id: restaurant._id, __v: restaurant.__v ?? { $exists: false } },
      { $set: fields, $inc: { __v: 1 } },
    );
    if (!update.modifiedCount) {
      await deleteRestaurantMedia([replacement.key]);
      return res.status(409).json({ message: "The restaurant media changed during upload. Refresh and retry." });
    }

    const cleanupFailed = await removeSupersededRestaurantMedia(
      restaurant, [restaurant.logo], "logo",
    ).catch(() => 1);
    return res.status(200).json({
      message: cleanupFailed
        ? "Logo uploaded. The previous S3 file could not be removed."
        : "Restaurant logo uploaded successfully.",
      cleanupFailed,
      data: { restaurantId: restaurant._id, businessId: restaurant.businessId, logo: replacement.url },
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurants = async (req, res, next) => {
  try {
    const { destination, category, month } = req.query;
    // Public listings must only surface restaurants explicitly marked active.
    const query = { isActive: true };

    if (destination) {
      query.destination = {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      };
    }
    if (category) {
      query.category = { $regex: escapeRegex(category), $options: "i" };
    }
    if (month) {
      query.month = { $regex: escapeRegex(month), $options: "i" };
    }

    const restaurants = await Restaurant.find(query).sort({
      destination: 1,
      restaurantName: 1,
    });
    return res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const getRestaurantsByDestination = async (req, res, next) => {
  try {
    const destination = String(req.params.destination || "").trim();

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const restaurants = await Restaurant.find({
      isActive: true,
      destination: {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      },
    }).sort({ restaurantName: 1 });

    return res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertRestaurants = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }

    const existingRestaurants = await Restaurant.find()
      .select("businessId restaurantName")
      .lean();
    const existingBusinessIds = new Set(
      existingRestaurants.map((restaurant) => restaurant.businessId?.trim()),
    );

    const rows = [];
    const errors = [];
    let rowNumber = 1;

    const parser = Readable.from(req.file.buffer.toString("utf-8")).pipe(
      csvParser(),
    );

    parser.on("data", (rawRow) => {
      rowNumber++;
      const row = normalizeRow(rawRow);
      const hasAnyValue = Object.values(row).some(
        (value) => value !== undefined && value !== null && value !== "",
      );

      if (!hasAnyValue) return;

      for (const column of REQUIRED_COLUMNS) {
        if (!row[column]) {
          errors.push({
            row: rowNumber,
            field: column,
            reason: "Required field missing",
          });
        }
      }

      rows.push({ rowNumber, row });
    });

    parser.on("error", next);

    parser.on("end", async () => {
      if (errors.length > 0) {
        return res.status(400).json({
          message: "CSV validation failed. No restaurants were inserted.",
          errorCount: errors.length,
          errors,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "The CSV file does not contain any restaurant rows.",
        });
      }

      try {
        const seenInCSV = new Set();
        const duplicateExistingRows = [];
        const duplicateCSVRows = [];
        const restaurants = [];

        for (const item of rows) {
          const businessId = item.row["Business ID"]?.trim();

          if (existingBusinessIds.has(businessId)) {
            duplicateExistingRows.push({
              row: item.rowNumber,
              businessId,
              businessName: item.row["Business Name"],
              reason: "Already exists in database",
            });
            continue;
          }

          if (seenInCSV.has(businessId)) {
            duplicateCSVRows.push({
              row: item.rowNumber,
              businessId,
              businessName: item.row["Business Name"],
              reason: "Duplicate within CSV",
            });
            continue;
          }

          seenInCSV.add(businessId);
          restaurants.push(buildRestaurant(item.row));
        }

        if (restaurants.length === 0) {
          return res.status(400).json({
            message: "No valid restaurant data found in CSV.",
            skippedExisting: duplicateExistingRows.length,
            duplicateExistingRows,
            skippedDuplicateInCSV: duplicateCSVRows.length,
            duplicateCSVRows,
          });
        }

        const result = await Restaurant.insertMany(restaurants, {
          ordered: false,
        });

        return res.status(201).json({
          message: "Restaurants uploaded successfully",
          total:
            restaurants.length +
            duplicateExistingRows.length +
            duplicateCSVRows.length,
          inserted: result.length,
          skippedExisting: duplicateExistingRows.length,
          duplicateExistingRows,
          skippedDuplicateInCSV: duplicateCSVRows.length,
          duplicateCSVRows,
        });
      } catch (error) {
        return next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addRestaurant = async (req, res, next) => {
  try {
    const payload = buildRestaurantPayload(req.body || {});
    const missingFields = validateRequiredRestaurantFields(payload);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Required restaurant fields are missing.",
        missingFields,
      });
    }

    const restaurant = await Restaurant.create(payload);

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const reviews = await RestaurantReview.find({
      status: "approved",
      $or: [
        { restaurant: restaurant._id },
        { restaurantId: restaurant.restaurantId },
        { businessId: restaurant.businessId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      ...restaurant,
      reviews,
      totalReviews: reviews.length || restaurant.totalReviews || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    const payload = buildRestaurantPayload(req.body || {}, { partial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "At least one restaurant field is required to update.",
      });
    }

    const emptyRequiredFields = ["restaurantName", "destination"].filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(payload, field) && !payload[field],
    );

    if (emptyRequiredFields.length > 0) {
      return res.status(400).json({
        message: "Required restaurant fields cannot be empty.",
        missingFields: emptyRequiredFields,
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value.",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isActive },
      { new: true, runValidators: true },
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: `Restaurant status updated to ${isActive ? "active" : "inactive"}`,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};
