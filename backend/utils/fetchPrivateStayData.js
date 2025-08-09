import PrivateStay from "../models/private-stay/PrivateStay.js";
import PrivateStayPointOfContact from "../models/private-stay/PointOfContact.js";
import PrivateStayReview from "../models/private-stay/Reviews.js";
import PrivateStayUnit from "../models/private-stay/Units.js";

const fetchPrivateStayData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };

  const [privateStays,  pocs, units, reviews] = await Promise.all([
    PrivateStay.find({ country: countryRegex, state: stateRegex })
      .lean()
      .exec(),
    PrivateStayPointOfContact.find({ isActive: true }).lean().exec(),
    PrivateStayUnit.find().lean().exec(),
    PrivateStayReview.find().lean().exec(),
  ]);

  return privateStays.map((stay) => {
    const stayId = stay._id.toString();
    return {
      ...stay,
      reviewCount: stay.reviews,
      pointOfContacts: pocs.filter(
        (item) => item.privateStay?.toString() === stayId
      ),
      units: units.filter((item) => item.privateStay?.toString() === stayId),
      reviews: reviews.filter(
        (item) => item?.privateStay?.toString() === stayId
      ),
      inclusions: company.inclusions.split(",").map((inc) => inc.trim()),
      type: "privateStay",
    };
  });
};

export default fetchPrivateStayData;
