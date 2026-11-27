import * as yup from "yup";
import BecomeContributor from "../models/BecomeContributor.js";
import mongoose from "mongoose";
import NomadUser from "../models/NomadUser.js";
import { CONTRIBUTOR_ROLE_OPTIONS, PARTNER_ROLE_KEYS, getContributorRoleStatus, getRequestedContributorRoles } from "../utils/contributorRoles.js";
import { notifyFirstContributorActivation } from "../utils/contributorActivationEmail.js";

const MESSAGE_CHARACTER_LIMIT = 1000;

const becomeContributorSchema = yup.object({
  contributionType: yup.string().required("Contribution type is required"),
  fullName: yup.string().required("Full name is required"),
  currentCountry: yup.string().required("Current country is required"),
  linkedinProfile: yup.string().required("Linkedin profile is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email")
    .required("Email is required"),
  contactCode: yup.string().required("Contact code is required"),
  contactNumber: yup.string().required("Contact number is required"),
  message: yup
    .string()
    .trim()
    .max(
      MESSAGE_CHARACTER_LIMIT,
      `Message cannot exceed ${MESSAGE_CHARACTER_LIMIT} characters`,
    )
    .default(""),
});

export const createBecomeContributor = async (req, res, next) => {
  try {
    const payload = await becomeContributorSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const becomeContributor = await BecomeContributor.create({ ...payload, nomadUser: req.userData?._id || null });

    return res.status(201).json({
      message: "Become contributor request submitted successfully",
      data: becomeContributor,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.errors[0] });
    }

    return next(error);
  }
};

export const getBecomeContributorRequests = async (req, res, next) => {
  try {
    const requests = await BecomeContributor.find().sort({ createdAt: -1 }).lean();
    const users = await NomadUser.find({ $or: [
      { _id: { $in: requests.map((lead) => lead.nomadUser).filter(Boolean) } },
      { email: { $in: requests.filter((lead) => !lead.nomadUser).map((lead) => lead.email) } },
    ] }).select("email isBlogger isNewsWriter isEventWriter isPlaceWriter isVisaPartner isCompanySetupPartner isActivationSupportPartner isConsultationSupportPartner isWorkationPartner").lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));
    const usersByEmail = new Map(users.map((user) => [user.email, user]));

    return res.status(200).json({
      message: "Become contributor requests fetched successfully",
      data: requests.map((lead) => ({
        ...lead,
        ...getContributorRoleStatus(lead.nomadUser ? usersById.get(String(lead.nomadUser)) : usersByEmail.get(lead.email)),
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateContributorLeadStatus = async (req, res, next) => {
  try {
    const { role, isActive, status } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(req.params.id) ||
        !Object.hasOwn(CONTRIBUTOR_ROLE_OPTIONS, role)) {
      return res.status(400).json({ message: "A valid lead and role are required." });
    }
    const lead = await BecomeContributor.findById(req.params.id).lean();
    if (!lead) return res.status(404).json({ message: "Contributor lead not found." });
    if (!getRequestedContributorRoles(lead.contributionType).includes(role)) {
      return res.status(400).json({ message: "This lead did not request that contributor role." });
    }

    if (PARTNER_ROLE_KEYS.includes(role)) {
      const normalizedStatus = String(status || "").trim().toLowerCase();
      if (!["pending", "approved", "rejected"].includes(normalizedStatus)) {
        return res.status(400).json({ message: "Partner lead status must be pending, approved or rejected." });
      }
      const updatedLead = await BecomeContributor.findByIdAndUpdate(
        req.params.id,
        { $set: { [`partnerStatuses.${role}`]: normalizedStatus } },
        { new: true, runValidators: true },
      ).lean();
      return res.status(200).json({
        message: `Partner lead marked as ${normalizedStatus}.`,
        data: updatedLead,
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "Contributor access requires a boolean status." });
    }
    // Older leads predate account linking; their registered email identifies the account.
    const user = await NomadUser.findOneAndUpdate(
      lead.nomadUser ? { _id: lead.nomadUser } : { email: lead.email },
      { $set: { [role]: isActive } },
      { new: true, runValidators: true },
    ).select("fullName email isBlogger isNewsWriter isEventWriter isPlaceWriter isVisaPartner isCompanySetupPartner isActivationSupportPartner isConsultationSupportPartner isWorkationPartner").lean();
    if (!user) return res.status(409).json({ message: "No Nomad account is linked to this lead. The contributor must register first." });
    let warning;
    // Partner roles get their own invite/registration flow, not the Contributions activation email.
    if (isActive && !PARTNER_ROLE_KEYS.includes(role)) {
      try {
        await notifyFirstContributorActivation(user);
      } catch (error) {
        console.error("Contributor activation email failed:", error.message);
        warning = "Contributor access is active, but the activation email could not be sent. Please retry marking this contributor active.";
      }
    }
    return res.status(200).json({
      message: warning || `Contributor access marked as ${isActive ? "active" : "inactive"}.`,
      ...(warning ? { warning } : {}),
      data: { ...lead, ...getContributorRoleStatus(user) },
    });
  } catch (error) {
    return next(error);
  }
};
