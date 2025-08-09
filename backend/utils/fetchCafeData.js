import Cafe from "../models/cafe/Cafe.js";
import CafePoc from "../models/cafe/PointOfContact.js";
import CafeReview from "../models/cafe/Review.js";

const fetchCafeData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };

  const [cafeCompanies, cafePocs, cafeReviews] = await Promise.all([
    Cafe.find({ country: countryRegex, state: stateRegex }).lean().exec(),
    CafePoc.find({ isActive: true }).lean().exec(),
    CafeReview.find().lean().exec(),
  ]);

  return cafeCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.reviews,
      pointOfContacts: cafePocs.filter(
        (item) => item.cafe?.toString() === companyId
      ),
      reviews: cafeReviews.filter(
        (item) => item.cafe?.toString() === companyId
      ),
      inclusions: company.inclusions.split(",").map((inc) => inc.trim()),
      type: "cafe",
    };
  });
};

export default fetchCafeData;
