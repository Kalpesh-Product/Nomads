import Workation from "../models/workations/Workations.js";
import WorkationUnits from "../models/workations/Units.js";
import WorkationPoc from "../models/workations/PointOfContact.js";
import WorkationReview from "../models/workations/Review.js";

export default async function fetchWorkationData(country, state) {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };

  const [workationCompanies, workationPoc, workationReviews, workationUnits] =
    await Promise.all([
      Workation.find({ country: countryRegex, state: stateRegex })
        .lean()
        .exec(),
      WorkationPoc.find({ isActive: true }).lean().exec(),
      WorkationReview.find().lean().exec(),
      WorkationUnits.find().lean().exec(),
    ]);

  return workationCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.totalReviews,
      pointOfContacts: workationPoc.filter(
        (item) => item.workation?.toString() === companyId
      ),
      reviews: workationReviews.filter(
        (item) => item.workation?.toString() === companyId
      ),
      inclusions: company.inclusions,
      units: workationUnits.filter(
        (unit) => unit.workation.toString() === company._id
      ),
      type: "workation",
    };
  });
}
