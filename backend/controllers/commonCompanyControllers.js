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
    } else {
      const [coworkingData, colivingData, hostelData] = await Promise.all([
        fetchCoworkingData(),
        fetchColivingData(),
        fetchHostelData(),
      ]);
      return res
        .status(200)
        .json([...coworkingData, ...colivingData, ...hostelData]);
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
        HostelInclusions.findOne({ hostelCompany: company._id }).lean().exec(),
        HostelPointOfContact.findOne({
          hostelCompany: company._id,
          isActive: true,
        })
          .lean()
          .exec(),
        HostelUnits.find({ businessId: company._id }).lean().exec(),
        HostelReviews.find({ hostelCompany: company._id }).lean().exec(),
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
    }

    return res
      .status(404)
      .json({ message: "Company not found or type invalid" });
  } catch (error) {
    next(error);
  }
};
