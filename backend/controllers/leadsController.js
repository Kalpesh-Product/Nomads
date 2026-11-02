import Lead from "../models/Lead.js";
import Company from "../models/Company.js";
import { describeMissingNomadListingStep } from "../utils/nomadListingStatus.js";

const hostPanelBaseUrl = () =>
  String(
    process.env.HOST_PANEL_BE ||
      (process.env.NODE_ENV === "production" ? "https://hostpanel.wono.co" : "http://localhost:5006"),
  ).trim().replace(/\/+$/, "");

const fetchWebsiteBookingAvailability = async (payload) => {
  const response = await fetch(`${hostPanelBaseUrl()}/api/public/booking/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload || {}),
    signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(8_000) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

export const checkWebsiteBookingAvailability = async (req, res, next) => {
  try {
    const { response, data } = await fetchWebsiteBookingAvailability(req.body);
    return res.status(response.status).json(data);
  } catch (error) {
    error.status = 503;
    error.message = "Live room availability is temporarily unavailable";
    next(error);
  }
};

export const createWebsiteLead = async (req, res, next) => {
  try {
    const {
      fullName,
      name,
      mobile,
      mobileNumber,
      phone,
      email,
      companyId,
      companyName,
      noOfPeople,
      people,
      attendees,
      startDate,
      endDate,
      source,
      productType,
      inquiryType,
      packageName,
      roomType,
      dormType,
      workspaceId,
      searchKey,
      websiteUrl,
      stayDuration,
      timeSlot,
      endTime,
      seating,
      duration,
      vertical,
      budget,
      location,
      message,
      comment,
    } = req.body;

    // Resolve required fields with fallbacks across the many aliases the
    // website builder sends
    const resolvedName = (fullName || name || "").trim();
    const resolvedMobile = (mobile || mobileNumber || phone || "").trim();
    const resolvedNoOfPeople =
      parseInt(noOfPeople || people || attendees || "1", 10) || 1;
    const resolvedProductType = (
      productType ||
      inquiryType ||
      packageName ||
      roomType ||
      dormType ||
      vertical ||
      ""
    ).trim();
    const resolvedPackageName = (
      packageName ||
      roomType ||
      dormType ||
      inquiryType ||
      ""
    ).trim();

    // Normalise source — hosted website sends "Website" (capital W)
    const resolvedSource = (source || "website").toLowerCase();

    if (!resolvedName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Look up company to get MongoDB _id, country, and state
    const company = await Company.findOne({ companyId }).lean();

    if (!company) {
      const stepMessage = await describeMissingNomadListingStep(companyId);
      return res
        .status(404)
        .json({ message: stepMessage || "Company not found" });
    }

    const lead = await Lead.create({
      fullName: resolvedName,
      mobileNumber: resolvedMobile,
      email: email?.trim().toLowerCase() || "",
      companyId: company.companyId,
      companyName: companyName || company.companyName,
      company: company._id,
      // Use company's location — same as nomads enquiry flow
      country: company.country || "",
      state: company.state || "",
      noOfPeople: resolvedNoOfPeople,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      source: resolvedSource,
      productType: resolvedProductType,
      verticalType: resolvedProductType,
      // Website builder specific fields
      workspaceId: workspaceId || "",
      packageName: resolvedPackageName,
      // An explicit inquiry type (e.g. "Tour Visit") wins over the product name.
      inquiryType: String(inquiryType || "").trim() || resolvedProductType,
      searchKey: searchKey || "",
      websiteUrl: websiteUrl || "",
      stayDuration: stayDuration || "",
      timeSlot: timeSlot || "",
      endTime: endTime ? String(endTime) : "",
      seating: seating ? String(seating) : "",
      duration: duration ? String(duration) : "",
      roomType: roomType || "",
      dormType: dormType || "",
      attendees: attendees ? String(attendees) : "",
      budget: budget ? String(budget) : "",
      location: location ? String(location) : "",
      message: (message || comment || "").trim(),
      // Website-builder leads skip the Master Panel manual-escalate step —
      // they go straight to the host's workspace the moment they land here,
      // since the workspace is already known from the website itself. Leads
      // with no resolvable workspaceId fall back to the normal review flow.
      ...(resolvedSource === "website" && workspaceId
        ? {
            status: "Closed",
            isEscalated: true,
            escalatedWorkspaceId: String(workspaceId).trim(),
            escalatedHostCompanyId: company.companyId || "",
            escalatedAt: new Date(),
          }
        : { status: "Pending", isEscalated: false }),
    });

    return res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};
