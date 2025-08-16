import fetchCoworkingData from "../utils/fetchCoworkingData.js";
import fetchColivingData from "../utils/fetchColivingData.js";
import fetchHostelData from "../utils/fetchHostelData.js";
import ColivingCompany from "../models/coliving/ColivingCompany.js";
import ColivingReviews from "../models/coliving/Reviews.js";
import ColivingPointOfContact from "../models/coliving/PointOfContact.js";
import ColivingUnits from "../models/coliving/Units.js";
import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";
import Hostels from "../models/hostels/Hostel.js";
import HostelReviews from "../models/hostels/Review.js";
import HostelPointOfContact from "../models/hostels/PointOfContact.js";
import HostelUnits from "../models/hostels/Unit.js";
import PrivateStay from "../models/private-stay/PrivateStay.js";
import PrivateStayPointOfContact from "../models/private-stay/PointOfContact.js";
import PrivateStayReview from "../models/private-stay/Reviews.js";
import PrivateStayUnit from "../models/private-stay/Units.js";
import fetchPrivateStayData from "../utils/fetchPrivateStayData.js";
import Cafe from "../models/cafe/Cafe.js";
import MeetingRoom from "../models/Meeting/MeetingRoom.js";
import CafePoc from "../models/cafe/PointOfContact.js";
import CafeReview from "../models/cafe/Review.js";
import fetchCafeData from "../utils/fetchCafeData.js";
import fetchWorkationData from "../utils/fetchWorkationData.js";
import Workation from "../models/workations/Workations.js";
import WorkationUnits from "../models/workations/Units.js";
import WorkationPoc from "../models/workations/PointOfContact.js";
import WorkationReview from "../models/workations/Review.js";
import { uploadFileToS3 } from "../config/s3Config.js";

export const getCompanyDataLocationWise = async (req, res, next) => {
  try {
    const { country, state, category } = req.query;
    if (category?.toLowerCase() === "coworking") {
      const coworkingData = await fetchCoworkingData(country, state);
      return res.status(200).json(coworkingData);
    } else if (category?.toLowerCase() === "coliving") {
      const colivingData = await fetchColivingData(country, state);
      return res.status(200).json(colivingData);
    } else if (category?.toLowerCase() === "hostel") {
      const hostelData = await fetchHostelData(country, state);
      return res.status(200).json(hostelData);
    } else if (category?.toLowerCase() === "privatestay") {
      const privateStayData = await fetchPrivateStayData(country, state);
      return res.status(200).json(privateStayData);
    } else if (category?.toLowerCase() === "cafe") {
      const cafeData = await fetchCafeData(country, state);
      return res.status(200).json(cafeData);
    } else if (category?.toLowerCase() === "workation") {
      const workationData = await fetchWorkationData(country, state);
      return res.status(200).json(workationData);
    } else {
      const [
        coworkingData,
        colivingData,
        hostelData,
        privateStayData,
        cafeData,
      ] = await Promise.all([
        fetchCoworkingData(country, state),
        fetchColivingData(country, state),
        fetchHostelData(country, state),
        fetchPrivateStayData(country, state),
        fetchCafeData(country, state),
      ]);
      return res
        .status(200)
        .json([
          ...coworkingData,
          ...colivingData,
          ...hostelData,
          ...privateStayData,
          ...cafeData,
        ]);
    }
  } catch (error) {
    next(error);
  }
};

export const getIndividualCompany = async (req, res, next) => {
  try {
    const { companyId, type } = req.query;
    if (type?.toLowerCase() === "workation") {
      const workationCompany = await Workation.findOne({ _id: companyId })
        .lean()
        .exec();
      const [pocs, services, reviews] = await Promise.all([
        WorkationPoc.findOne({
          coworkingCompany: companyId,
          isActive: true,
        })
          .lean()
          .exec(),
        WorkationUnits.findOne({ workation: companyId }).lean().exec(),
        WorkationReview.find({ workation: companyId }).lean().exec(),
      ]);

      const companyObject = {
        ...workationCompany,
        reviewCount: workationCompany.reviews,
        pocs,
        services,
        reviews,
        type: "Coworking",
        inclusions: workationCompany.inclusions,
      };
      return res.status(200).json(companyObject);
    }

    if (type?.toLowerCase() === "coworking") {
      const company = await CoworkingCompany.findOne({ _id: companyId })
        .lean()
        .exec();

      const [pocs, services, reviews] = await Promise.all([
        CoworkingPointOfContact.findOne({
          coworkingCompany: company._id,
          isActive: true,
        })
          .lean()
          .exec(),
        CoworkingServices.findOne({ coworkingCompany: company._id })
          .lean()
          .exec(),
        CoworkingReviews.find({ coworkingCompany: company._id }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        pocs,
        services,
        reviews,
        type: "Coworking",
        inclusions: company.inclusions
          .split(",")
          .map((inc) =>
            inc?.split(" ").length
              ? inc?.split(" ")?.join("").toLowerCase().trim()
              : inc?.trim().toLowerCase()
          ),
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "coliving") {
      const company = await ColivingCompany.findOne({ _id: companyId })
        .lean()
        .exec();

      const [pocs, units, reviews] = await Promise.all([
        ColivingPointOfContact.findOne({
          colivingCompany: company._id,
          isActive: true,
        })
          .lean()
          .exec(),
        ColivingUnits.find({ businessId: company._id }).lean().exec(),
        ColivingReviews.find({ colivingCompany: company._id }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        pocs,
        units,
        reviews,
        type: "Coliving",
        inclusions: company.inclusions
          .split(",")
          .map((inc) =>
            inc?.split(" ").length
              ? inc?.split(" ")?.join("").toLowerCase().trim()
              : inc?.trim().toLowerCase()
          ),
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "hostel") {
      const company = await Hostels.findOne({ _id: companyId }).lean().exec();

      const [pocs, units, reviews] = await Promise.all([
        HostelPointOfContact.findOne({
          hostelCompany: company._id,
          isActive: true,
        })
          .lean()
          .exec(),
        HostelUnits.find({ hostel: companyId }).lean().exec(),
        HostelReviews.find({ hostel: companyId }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        pocs,
        units,
        reviews,
        type: "Hostel",
        inclusions: company.inclusions
          .split(",")
          .map((inc) =>
            inc?.split(" ").length
              ? inc?.split(" ")?.join("").toLowerCase().trim()
              : inc?.trim().toLowerCase()
          ),
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "privatestay") {
      const company = await PrivateStay.findOne({ _id: companyId })
        .lean()
        .exec();

      const [pocs, units, reviews] = await Promise.all([
        PrivateStayPointOfContact.findOne({
          privateStay: company._id,
          isActive: true,
        })
          .lean()
          .exec(),
        PrivateStayUnit.find({ privateStay: company._id }).lean().exec(),
        PrivateStayReview.find({ privateStay: company._id }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        pocs,
        units,
        reviews,
        type: "Private-Stay",
        inclusions: company.inclusions
          .split(",")
          .map((inc) =>
            inc?.split(" ").length
              ? inc?.split(" ")?.join("").toLowerCase().trim()
              : inc?.trim().toLowerCase()
          ),
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "cafe") {
      const company = await Cafe.findOne({ _id: companyId }).lean().exec();

      const [pocs, reviews] = await Promise.all([
        CafePoc.findOne({ cafe: company._id, isActive: true }).lean().exec(),
        CafeReview.find({ cafe: company._id }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        pocs,
        reviews,
        type: "Cafe",
        inclusions: company.inclusions
          .split(",")
          .map((inc) =>
            inc?.split(" ").length
              ? inc?.split(" ")?.join("").toLowerCase().trim()
              : inc?.trim().toLowerCase()
          ),
      };
      return res.status(200).json(companyObject);
    }

    return res
      .status(404)
      .json({ message: "Company not found or type invalid" });
  } catch (error) {
    next(error);
  }
};

const companyModels = {
  coworking: CoworkingCompany,
  coliving: ColivingCompany,
  hostels: Hostels,
  "private-stay": PrivateStay,
  cafe: Cafe,
};

export const uploadCompanyImages = async (req, res, next) => {
  try {
    const file = req.file;
    const { type, companyType, companyId } = req.body;

    const Model = companyModels[companyType?.toLowerCase()];
    if (!Model) {
      return res.status(400).json({ message: "Invalid company type" });
    }

    const company = await Model.findById(companyId).exec();
    if (!company) {
      return res.status(404).json({ message: "No such company found" });
    }

    const folderPath = `nomads/${companyType}/${company.companyName}`;

    let s3Key;
    if (type.toLowerCase() === "logo") {
      s3Key = `${folderPath}/logo/${file?.originalname}`;
    } else {
      s3Key = `${folderPath}/images/${file?.originalname}`;
    }

    try {
      const uploadedUrl = await uploadFileToS3(s3Key, file);

      if (type.toLowerCase() === "logo") {
        company.logo = uploadedUrl;
      } else {
        company.images.push({
          url: uploadedUrl,
          index: company.images.length + 1,
        });
      }

      await company.save({ validateBeforeSave: false });

      return res.status(200).json({
        message: `Successfully uploaded ${companyType} company ${type.toLowerCase()}`,
      });
    } catch (uploadError) {
      return res.status(500).json({ message: "Failed to upload image to S3" });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllCompanyLocations = async (req, res, next) => {
  try {
    const models = [
      Cafe,
      ColivingCompany,
      CoworkingCompany,
      Hostels,
      MeetingRoom,
      PrivateStay,
      Workation,
    ];

    const locationMap = new Map();

    for (const model of models) {
      const countries = await model.distinct("country");
      const states = await model.distinct("state");

      for (const ctry of countries) {
        if (!ctry) continue;

        if (!locationMap.has(ctry)) {
          locationMap.set(ctry, {
            country: ctry,
            states: [],
          });
        }

        if (states && states.length > 0) {
          const entry = locationMap.get(ctry);

          entry.states = [...new Set([...entry.states, ...states])];
        }
      }
    }

    return res.status(200).json([...locationMap.values()]);
  } catch (error) {
    next(error);
  }
};
