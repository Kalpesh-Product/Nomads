import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingInclusions from "../models/coworking/Inclusions.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";

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
    }
  } catch (error) {
    next(error);
  }
};
