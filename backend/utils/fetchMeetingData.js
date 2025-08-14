import MeetingRoom from "../models/Meeting/MeetingRoom.js";
import MeetingPoc from "../models/Meeting/PointOfContact.js";
import MeetingReview from "../models/Meeting/Review.js";
import MeetingService from "../models/Meeting/Services.js";

export default async function fetchMeetingData(country, state) {
  const countryRegex = { $regex: `^${country}$`, $options: "i" };
  const stateRegex = { $regex: `^${state}$`, $options: "i" };
  const [meetingCompanies, meetingPoc, meetingServices, meetingReviews] =
    await Promise.all([
      MeetingRoom.find({ country: countryRegex, state: stateRegex })
        .lean()
        .exec(),
      MeetingPoc.find({ isActive: true }).lean().exec(),
      MeetingService.find().lean().exec(),
      MeetingReview.find().lean().exec(),
    ]);

  return meetingCompanies.map((company) => {
    const companyId = company._id.toString();
    return {
      ...company,
      reviewCount: company.totalReviews,
      pointOfContacts: meetingPoc.filter(
        (item) => item.meeting?.toString() === companyId
      ),
      services: meetingServices.filter(
        (item) => item.meeting?.toString() === companyId
      ),
      reviews: meetingReviews.filter(
        (item) => item.meeting?.toString() === companyId
      ),
      inclusions: company.inclusions
        .split(",")
        .map((inc) =>
          inc?.split(" ").length
            ? inc?.split(" ")?.join("").toLowerCase().trim()
            : inc?.trim().toLowerCase()
        ),
      type: "meeting",
    };
  });
}
