import CoworkingCompany from "../models/coworking/CoworkingCompany";
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
          country,
          state,
        })
          .lean()
          .exec(),
        CoworkingInclusions.findOne().lean().exec(),
        CoworkingPointOfContact.findOne({
          isActive: true,
        })
          .lean()
          .exec(),
        CoworkingServices.findOne().lean().exec(),
        CoworkingServices.findOne().lean().exec(),
      ]);

      const enrichedCompanies = companies.map((company) => {
        const companyId = company._id.toString();

        const companyInclusions = inclusions.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyPOCs = pocs.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyServices = services.filter(
          (item) => item.coworkingCompany?.toString() === companyId
        );

        const companyReviews = reviews.filter(
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

      return res.status(200).json(enrichedCompanies)
    }
  } catch (error) {
    next(error);
  }
};
