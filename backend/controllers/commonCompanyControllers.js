import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingInclusions from "../models/coworking/Inclusions.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";
import ColivingCompany from "../models/coliving/ColivingCompany.js";
import ColivingInclusions from "../models/coliving/ColivingInclusions.js";
import ColivingReviews from "../models/coliving/Reviews.js";
import ColivingPointOfContact from "../models/coliving/PointOfContact.js";
import ColivingUnits from "../models/coliving/Units.js";
import Hostels from "../models/hostels/Hostel.js";
import HostelReviews from "../models/hostels/Review.js";
import HostelPointOfContact from "../models/hostels/PointOfContact.js";
import HostelUnits from "../models/hostels/Unit.js";
import HostelInclusions from "../models/hostels/Inclusions.js";

export const getCompanyDataLocationWise = async (req, res, next) => {
  try {
    const { country, state, category } = req.query;

    const countryRegex = { $regex: `^${country}$`, $options: "i" };
    const stateRegex = { $regex: `^${state}$`, $options: "i" };

    const fetchCoworkingData = async () => {
      const [
        coworkingCompanies,
        coworkingInclusions,
        coworkingPoc,
        coworkingServices,
        coworkingReviews,
      ] = await Promise.all([
        CoworkingCompany.find({ country: countryRegex, state: stateRegex })
          .lean()
          .exec(),
        CoworkingInclusions.find().lean().exec(),
        CoworkingPointOfContact.find({ isActive: true }).lean().exec(),
        CoworkingServices.find().lean().exec(),
        CoworkingReviews.find().lean().exec(),
      ]);

      return coworkingCompanies.map((company) => {
        const companyId = company._id.toString();
        return {
          ...company,
          reviewCount: company.reviews,
          inclusions: coworkingInclusions.filter(
            (item) => item.coworkingCompany?.toString() === companyId
          ),
          pointOfContacts: coworkingPoc.filter(
            (item) => item.coworkingCompany?.toString() === companyId
          ),
          services: coworkingServices.filter(
            (item) => item.coworkingCompany?.toString() === companyId
          ),
          reviews: coworkingReviews.filter(
            (item) => item.coworkingCompany?.toString() === companyId
          ),
          type: "coworking",
        };
      });
    };

    const fetchColivingData = async () => {
      const [
        colivingCompanies,
        colivingInclusions,
        colivingPoc,
        colivingUnits,
        colivingReviews,
      ] = await Promise.all([
        ColivingCompany.find({ country: countryRegex, state: stateRegex })
          .lean()
          .exec(),
        ColivingInclusions.find().lean().exec(),
        ColivingPointOfContact.find({ isActive: true }).lean().exec(),
        ColivingUnits.find().lean().exec(),
        ColivingReviews.find().lean().exec(),
      ]);

      return colivingCompanies.map((company) => {
        const companyId = company._id.toString();
        return {
          ...company,
          reviewCount: company.reviews,
          inclusions: colivingInclusions.filter(
            (item) => item.colivingCompany?.toString() === companyId
          ),
          pointOfContacts: colivingPoc.filter(
            (item) => item.colivingCompany?.toString() === companyId
          ),
          units: colivingUnits.filter(
            (item) => item.businessId?.toString() === companyId
          ),
          reviews: colivingReviews.filter(
            (item) => item.colivingCompany?.toString() === companyId
          ),
          type: "coliving",
        };
      });
    };

    const fetchHostelData = async () => {
      const [
        hostelCompanies,
        hostelInclusions,
        hostelPoc,
        hostelUnits,
        hostelReviews,
      ] = await Promise.all([
        Hostels.find({ country: countryRegex, state: stateRegex })
          .lean()
          .exec(),
        HostelInclusions.find().lean().exec(),
        HostelPointOfContact.find({ isActive: true }).lean().exec(),
        HostelUnits.find().lean().exec(),
        HostelReviews.find().lean().exec(),
      ]);

      return hostelCompanies.map((company) => {
        const companyId = company._id.toString();
        return {
          ...company,
          reviewCount: company.reviews,
          inclusions: hostelInclusions.filter(
            (item) => item.hostelCompany?.toString() === companyId
          ),
          pointOfContacts: hostelPoc.filter(
            (item) => item.hostelCompany?.toString() === companyId
          ),
          units: hostelUnits.filter(
            (item) => item.businessId?.toString() === companyId
          ),
          reviews: hostelReviews.filter(
            (item) => item.hostelCompany?.toString() === companyId
          ),
          type: "hostel",
        };
      });
    };

    if (category?.toLowerCase() === "coworking") {
      const coworkingData = await fetchCoworkingData();
      return res.status(200).json(coworkingData);
    } else if (category?.toLowerCase() === "coliving") {
      const colivingData = await fetchColivingData();
      return res.status(200).json(colivingData);
    } else if (category?.toLowerCase() === "hostel") {
      const hostelData = await fetchHostelData();
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
