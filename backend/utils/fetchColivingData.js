import ColivingCompany from "../models/coliving/ColivingCompany.js";
import ColivingReviews from "../models/coliving/Reviews.js";
import ColivingPointOfContact from "../models/coliving/PointOfContact.js";
import ColivingUnits from "../models/coliving/Units.js";

const fetchColivingData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };
  const [colivingCompanies, colivingPoc, colivingUnits, colivingReviews] =
    await Promise.all([
      ColivingCompany.find({ country: countryRegex, state: stateRegex })
        .lean()
        .exec(),
      ColivingPointOfContact.find({ isActive: true }).lean().exec(),
      ColivingUnits.find().lean().exec(),
      ColivingReviews.find().lean().exec(),
    ]);

  return colivingCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.reviews,
      pointOfContacts: colivingPoc.filter(
        (item) => item.colivingCompany?.toString() === companyId
      ),
      units: colivingUnits.filter(
        (item) => item.businessId?.toString() === companyId
      ),
      reviews: colivingReviews.filter(
        (item) => item.colivingCompany?.toString() === companyId
      ),
      inclusions: company.inclusions
        .split(",")
        .map((inc) =>
          inc?.split(" ").length
            ? inc?.split(" ")?.join("").toLocaleLowerCase().trim()
            : inc?.trim().toLocaleLowerCase()
        ),
      type: "coliving",
    };
  });
};

export default fetchColivingData;
