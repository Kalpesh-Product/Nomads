import fetchCoworkingData from "../utils/fetchCoworkingData.js";
import fetchColivingData from "../utils/fetchColivingData.js";
import fetchHostelData from "../utils/fetchHostelData.js";
import ColivingCompany from "../models/coliving/ColivingCompany.js";
import ColivingInclusions from "../models/coliving/ColivingInclusions.js";
import ColivingReviews from "../models/coliving/Reviews.js";
import ColivingPointOfContact from "../models/coliving/PointOfContact.js";
import ColivingUnits from "../models/coliving/Units.js";
import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingInclusions from "../models/coworking/Inclusions.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";
import Hostels from "../models/hostels/Hostel.js";
import HostelReviews from "../models/hostels/Review.js";
import HostelPointOfContact from "../models/hostels/PointOfContact.js";
import HostelUnits from "../models/hostels/Unit.js";
import HostelInclusions from "../models/hostels/Inclusions.js";
import PrivateStay from "../models/private-stay/PrivateStay.js";
import PrivateStayInclusions from "../models/private-stay/Inclusions.js";
import PrivateStayPointOfContact from "../models/private-stay/PointOfContact.js";
import PrivateStayReview from "../models/private-stay/Reviews.js";
import PrivateStayUnit from "../models/private-stay/Units.js";
import fetchPrivateStayData from "../utils/fetchPrivateStayData.js";
import Cafe from "../models/cafe/Cafe.js";
import CafeInclusions from "../models/cafe/Inclusions.js";
import CafePoc from "../models/cafe/PointOfContact.js";
import CafeReview from "../models/cafe/Review.js";
import fetchCafeData from "../utils/fetchCafeData.js";
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

    if (type?.toLowerCase() === "coworking") {
      const company = await CoworkingCompany.findOne({ _id: companyId })
        .lean()
        .exec();

      const [inclusions, pocs, services, reviews] = await Promise.all([
        CoworkingInclusions.findOne({ coworkingCompany: company._id })
          .lean()
          .exec(),
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
        inclusions,
        pocs,
        services,
        reviews,
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "coliving") {
      const company = await ColivingCompany.findOne({ _id: companyId })
        .lean()
        .exec();

      const [inclusions, pocs, units, reviews] = await Promise.all([
        ColivingInclusions.findOne({ colivingCompany: company._id })
          .lean()
          .exec(),
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
        inclusions,
        pocs,
        units,
        reviews,
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "hostel") {
      const company = await Hostels.findOne({ _id: companyId }).lean().exec();

      const [inclusions, pocs, units, reviews] = await Promise.all([
        HostelInclusions.findOne({ hostel: companyId }).lean().exec(),
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
        inclusions,
        pocs,
        units,
        reviews,
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "privatestay") {
      const company = await PrivateStay.findOne({ _id: companyId })
        .lean()
        .exec();

      const [inclusions, pocs, units, reviews] = await Promise.all([
        PrivateStayInclusions.findOne({ privateStay: company._id })
          .lean()
          .exec(),
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
        inclusions,
        pocs,
        units,
        reviews,
      };
      return res.status(200).json(companyObject);
    } else if (type?.toLowerCase() === "cafe") {
      const company = await Cafe.findOne({ _id: companyId }).lean().exec();

      const [inclusions, pocs, reviews] = await Promise.all([
        CafeInclusions.findOne({ cafe: company._id }).lean().exec(),
        CafePoc.findOne({ cafe: company._id, isActive: true }).lean().exec(),
        CafeReview.find({ cafe: company._id }).lean().exec(),
      ]);

      const companyObject = {
        ...company,
        reviewCount: company.reviews,
        inclusions,
        pocs,
        reviews,
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
