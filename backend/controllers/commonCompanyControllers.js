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
