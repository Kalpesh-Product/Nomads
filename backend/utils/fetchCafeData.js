import Cafe from "../models/cafe/Cafe.js";
import CafeInclusions from "../models/cafe/Inclusions.js";
import CafePoc from "../models/cafe/PointOfContact.js";
import CafeReview from "../models/cafe/Review.js";

const fetchCafeData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };

  const [cafeCompanies, cafeInclusions, cafePocs, cafeReviews] =
    await Promise.all([
      Cafe.find({ country: countryRegex, state: stateRegex }).lean().exec(),
      CafeInclusions.find().lean().exec(),
      CafePoc.find({ isActive: true }).lean().exec(),
      CafeReview.find().lean().exec(),
    ]);

  return cafeCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.reviews,
      inclusions: cafeInclusions.filter(
        (item) => item.cafe?.toString() === companyId
      ),
      pointOfContacts: cafePocs.filter(
        (item) => item.cafe?.toString() === companyId
      ),
      reviews: cafeReviews.filter(
        (item) => item.cafe?.toString() === companyId
      ),
      type: "cafe",
    };
  });
};

export default fetchCafeData;
