import Lead from "../models/Lead.js";
import Company from "../models/Company.js";

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
      return res.status(404).json({ message: "Company not found" });
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
      inquiryType: resolvedProductType,
      searchKey: searchKey || "",
      websiteUrl: websiteUrl || "",
      stayDuration: stayDuration || "",
      timeSlot: timeSlot || "",
      roomType: roomType || "",
      dormType: dormType || "",
      attendees: attendees ? String(attendees) : "",
      budget: budget ? String(budget) : "",
      location: location ? String(location) : "",
      message: (message || comment || "").trim(),
      status: "Pending",
      isEscalated: false,
    });

    return res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};
