import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingInclusions from "../models/coworking/Inclusions.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";

const fetchCoworkingData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };
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

export default fetchCoworkingData;
