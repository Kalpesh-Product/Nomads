import PrivateStay from "../models/private-stay/PrivateStay.js";
import PrivateStayInclusions from "../models/private-stay/Inclusions.js";
import PrivateStayPointOfContact from "../models/private-stay/PointOfContact.js";
import PrivateStayReview from "../models/private-stay/Reviews.js";
import PrivateStayUnit from "../models/private-stay/Units.js";

const fetchPrivateStayData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };

  const [privateStays, inclusions, pocs, units, reviews] = await Promise.all([
    PrivateStay.find({ country: countryRegex, state: stateRegex })
      .lean()
      .exec(),
    PrivateStayInclusions.find().lean().exec(),
    PrivateStayPointOfContact.find({ isActive: true }).lean().exec(),
    PrivateStayUnit.find().lean().exec(),
    PrivateStayReview.find().lean().exec(),
  ]);

  return privateStays.map((stay) => {
    const stayId = stay._id.toString();
    return {
      ...stay,
      reviewCount: stay.reviews,
      inclusions: inclusions.filter(
        (item) => item.privateStay?.toString() === stayId
      ),
      pointOfContacts: pocs.filter(
        (item) => item.privateStayCompany?.toString() === stayId
      ),
      units: units.filter((item) => item.privateStay?.toString() === stayId),
      reviews: reviews.filter(
        (item) => item.privateStay?.toString() === stayId
      ),
      type: "private-stay",
    };
  });
};

export default fetchPrivateStayData;
