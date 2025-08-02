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

export const getCompanyDataLocationWise = async (req, res, next) => {
  try {
    const { country, state, category } = req.query;
    if (category?.toLowerCase() === "coworking") {
      const [
        coworkingCompanies,
        coworkingInclusions,
        coworkingPoc,
        coworkingServices,
        coworkingReviews,
      ] = await Promise.all([
        CoworkingCompany.find({
          country: { $regex: `^${country}$`, $options: "i" },
          state: { $regex: `^${state}$`, $options: "i" },
        })
          .lean()
          .exec(),
        CoworkingInclusions.find().lean().exec(),
        CoworkingPointOfContact.find({
          isActive: true,
        })
          .lean()
          .exec(),
        CoworkingServices.find().lean().exec(),
        CoworkingReviews.find().lean().exec(),
      ]);

      const enrichedCompanies = coworkingCompanies.map((company) => {
        const companyId = company._id.toString();

        const companyInclusions = coworkingInclusions.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyPOCs = coworkingPoc.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyServices = coworkingServices.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyReviews = coworkingReviews.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        return {
          ...company,
          inclusions: companyInclusions,
          pointOfContacts: companyPOCs,
          services: companyServices,
          reviews: companyReviews,
        };
      });

      return res.status(200).json(enrichedCompanies);
    } else if (category?.toLowerCase() === "coliving") {
      const [
        colivingCompanies,
        colivingInclusions,
        colivingPoc,
        colivingUnits,
        colivingReviews,
      ] = await Promise.all([
        ColivingCompany.find({
          country: { $regex: `^${country}$`, $options: "i" },
          state: { $regex: `^${state}$`, $options: "i" },
        })
          .lean()
          .exec(),
        ColivingInclusions.find().lean().exec(),
        ColivingPointOfContact.find({ isActive: true }).lean().exec(),
        ColivingUnits.find().lean().exec(),
        ColivingReviews.find().lean().exec(),
      ]);

      const enrichedCompanies = colivingCompanies.map((company) => {
        const companyId = company._id.toString();

        const companyInclusions = colivingInclusions.filter(
          (item) => item.colivingCompany?.toString() === companyId
        );

        const companyPOCs = colivingPoc.filter(
          (item) => item.colivingCompany?.toString() === companyId
        );

        const companyUnits = colivingUnits.filter(
          (item) => item.colivingCompany?.toString() === companyId
        );

        const companyReviews = colivingReviews.filter(
          (item) => item.colivingCompany?.toString() === companyId
        );

        return {
          ...company,
          inclusions: companyInclusions,
          pointOfContacts: companyPOCs,
          units: companyUnits,
          reviews: companyReviews,
        };
      });

      return res.status(200).json(enrichedCompanies);
    }
    return res.status(404).json({ message: "No resource found" });
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
