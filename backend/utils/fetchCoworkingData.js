import CoworkingCompany from "../models/coworking/CoworkingCompany.js";
import CoworkingReviews from "../models/coworking/Review.js";
import CoworkingServices from "../models/coworking/Services.js";
import CoworkingPointOfContact from "../models/coworking/PointOfContact.js";

const fetchCoworkingData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };
  const [
    coworkingCompanies,
    coworkingPoc,
    coworkingServices,
    coworkingReviews,
  ] = await Promise.all([
    CoworkingCompany.find({ country: countryRegex, state: stateRegex })
      .lean()
      .exec(),
    CoworkingPointOfContact.find({ isActive: true }).lean().exec(),
    CoworkingServices.find().lean().exec(),
    CoworkingReviews.find().lean().exec(),
  ]);

  return coworkingCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.reviews,
      pointOfContacts: coworkingPoc.filter(
        (item) => item.coworkingCompany?.toString() === companyId
      ),
      services: coworkingServices.filter(
        (item) => item.coworkingCompany?.toString() === companyId
      ),
      reviews: coworkingReviews.filter(
        (item) => item.coworkingCompany?.toString() === companyId
      ),
      inclusions: company.inclusions.split(",").map((inc) => inc.trim()),
      type: "coworking",
    };
  });
};

export default fetchCoworkingData;
