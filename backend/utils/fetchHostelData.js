import Hostels from "../models/hostels/Hostel.js";
import HostelReviews from "../models/hostels/Review.js";
import HostelPointOfContact from "../models/hostels/PointOfContact.js";
import HostelUnits from "../models/hostels/Unit.js";

const fetchHostelData = async (country, state) => {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };
  const [hostelCompanies, hostelPoc, hostelUnits, hostelReviews] =
    await Promise.all([
      Hostels.find({ country: countryRegex, state: stateRegex }).lean().exec(),
      HostelPointOfContact.find({ isActive: true }).lean().exec(),
      HostelUnits.find().lean().exec(),
      HostelReviews.find().lean().exec(),
    ]);

  return hostelCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.reviews,
      pointOfContacts: hostelPoc.filter(
        (item) => item.hostel?.toString() === companyId
      ),
      units: hostelUnits.filter(
        (item) => item.hostel?.toString() === companyId
      ),
      reviews: hostelReviews.filter(
        (item) => item.hostel?.toString() === companyId
      ),
      inclusions: company.inclusions
        .split(",")
        .map((inc) =>
          inc?.split(" ").length
            ? inc?.split(" ")?.join("").toLocaleLowerCase().trim()
            : inc?.trim().toLocaleLowerCase()
        ),
      type: "hostel",
    };
  });
};

export default fetchHostelData;
