import * as yup from "yup";
import Lead from "../../models/Lead.js";
import mongoose from "mongoose";
import { sendMail, sendAdminFormNotification } from "../../config/mailer.js"; // adjust path if different
import User from "../../models/NomadUser.js";
import NomadUser from "../../models/NomadUser.js";
import VisaSupport from "../../models/VisaSupport.js";
import OverallActivationSupport from "../../models/OverallActivationSupport.js";
import NewCompanySetup from "../../models/NewCompanySetup.js";
import Consultation from "../../models/Consultation.js";
import Workation from "../../models/Workation.js";
import BecomeContributor from "../../models/BecomeContributor.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { uploadFileToS3 } from "../../config/s3Config.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  toDMY,
  referenceDateStamp,
  formatSubmittedOn,
  formatLongDate,
  renderNotificationEmail,
} from "../../utils/emailTemplates.js";

const AI_CONTRIBUTOR_MESSAGE_CHARACTER_LIMIT = 1000;
const AI_FAST_RESPONSE_SHEETS = new Set([
  "AI_Visa_Support",
  "AI_Overall_Activation_Support",
  "AI_New_Company_Setup",
  "AI_Consultation",
  "AI_Workation",
  "AI_Become_Contributor",
]);

function istNowPieces() {
  const tz = "Asia/Kolkata";
  const now = new Date();
  const submissionDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const submissionTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\u202F/g, "");
  return { submissionDate, submissionTime };
}

const jobApplicationSchema = yup.object({
  jobPosition: yup.string().trim().required("Job Position is required"),
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email().required("Valid email is required"),
  dob: yup
    .string()
    .trim()
    .nullable()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD")
    .optional(),
  mobile: yup
    .string()
    .trim()
    .required("Mobile Number is required")
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.mobile = number.number;
          return true;
        } catch {
          return false;
        }
      },
    ),
  // .matches(/^[0-9+\-\s()]{8,20}$/, "Invalid mobile number"),
  location: yup.string().trim().required("Location is required"),
  experienceYears: yup
    .number()
    .typeError("Experience (in years) must be a number")
    .min(0)
    .max(60)
    .required("Experience (in years) is required"),
  linkedin: yup.string().trim().url().nullable(),
  currentMonthlySalary: yup
    .number()
    .typeError("Current Monthly Salary must be a number")
    .min(0)
    .nullable(),
  expectedMonthlySalary: yup
    .number()
    .typeError("Expected Monthly Salary must be a number")
    .min(0)
    .nullable(),
  joinInDays: yup.string().trim().required("Join-in days is required"),
  relocateGoa: yup
    .string()
    .trim()
    .oneOf(["Yes", "No"], "Relocate must be 'Yes' or 'No'")
    .required("Relocate to Goa is required"),
  personality: yup.string().trim().required("Tell us about yourself"),
  skills: yup.string().trim().required("Skills are required"),
  whyConsider: yup.string().trim().required("Why should we consider you?"),
  willingToBootstrap: yup.string().trim().required("Willing to bootstrap?"),
  message: yup.string().trim().nullable(),
  remarks: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const enquirySchema = yup.object({
  companyName: yup.string().trim().required("Please provide the company name"),
  companyType: yup.string().trim().required("Please provide the company type"),
  fullName: yup
    .string()
    .trim()
    .min(1, "Please provide a valid name")
    .required("Please provide your full name"),
  personelCount: yup
    .number()
    .typeError("Personnel count must be a number")
    .integer("Personnel count must be an integer")
    .min(1, "Personnel count must be at least 1")
    .required("Please provide the personnel count"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email"),
  phone: yup
    .string()
    .trim()
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.phone = number.number;
          return true;
        } catch {
          return false;
        }
      },
    )
    // .matches(/^\+?[0-9]{7,15}$/, "Please provide a valid phone number")
    .required("Please provide your phone number"),
  startDate: yup
    .date()
    .typeError("Please provide a valid start date")
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Start date cannot be in the past",
    )
    .required("Please provide the start date"),
  endDate: yup
    .date()
    .typeError("Please provide a valid end date")
    .min(yup.ref("startDate"), "End date cannot be before the start date")
    .required("Please provide the end date"),
  source: yup
    .string()
    .trim()
    .oneOf(["nomad", "website"], "Source must be either 'nomad' or 'website'")
    .required("Please provide the source"),
  productType: yup
    .string()
    .trim()
    .min(1, "Please provide a valid the product type")
    .required("Please provide the product type"),
  country: yup.string().trim().nullable(),
  state: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const pocSchema = yup.object().shape({
  pocName: yup
    .string()
    .min(1, "Please provide a valid name")
    .required("Please provide the POC name"),
  pocCompany: yup.string().required("Please provide the POC company name"),
  pocDesignation: yup.string().required("Please provide the POC designation"),
  fullName: yup.string().required("Please provide your full name"),
  mobile: yup
    .string()
    .trim()
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.mobile = number.number;
          return true;
        } catch {
          return false;
        }
      },
    )
    // .matches(/^\+?[0-9]{7,15}$/, "Please provide a valid mobile number")
    .required("Please provide the mobile"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email"),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const connectWithUsSchema = yup.object().shape({
  name: yup
    .string()
    .min(1, "Please provide your valid full name.")
    .required("Please provide your full name."),
  email: yup
    .string()
    .email("Please provide a valid email.")
    .required("Please provide your email."),
  mobile: yup
    .string()
    .trim()
    .required("Please provide the mobile")
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.mobile = number.number;
          return true;
        } catch {
          return false;
        }
      },
    ),
  typeOfPartnerShip: yup
    .string()
    .required("Please provide the type of partnership."),
  message: yup.string().required("Please provide a brief messsage."),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const nomadsSignupSchema = yup
  .object()
  .shape({
    fullName: yup.string().trim().optional(),
    fullName: yup.string().trim().required("Full name is required"),
    countryOfResidence: yup.string().trim().optional(),
    country: yup.string().trim().optional(),
    email: yup
      .string()
      .email("Please provide a valid email")
      .required("Please provide your email"),
    password: yup.string().optional(),
    mobile: yup
      .string()
      .trim()
      .required("Please provide the mobile")
      .test(
        "is-valid-phone",
        "Please provide a valid phone number",
        function (value) {
          if (!value) return false;
          try {
            const number = parsePhoneNumberFromString(value);
            if (!number?.isValid()) return false;

            // store the normalized version on the validated data
            this.parent.mobile = number.number;
            return true;
          } catch {
            return false;
          }
        },
      ),
    sheetName: yup.string().required("Please provide a sheet name"),
  })
  .test(
    "name-present",
    "Please provide your full name or first and last name",
    (value) => {
      const hasFullName = Boolean(value?.fullName?.trim());
      const hasFirstAndLast = Boolean(value?.fullName?.trim());

      return hasFullName || hasFirstAndLast;
    },
  );

const contentRemovalRequestsSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .min(1, "Please provide a valid full name")
    .required("Please provide your full name"),
  mobile: yup
    .string()
    .trim()
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.mobile = number.number;
          return true;
        } catch {
          return false;
        }
      },
    )
    // .matches(/^\+?[0-9]{7,15}$/, "Please provide a valid mobile number")
    .required("Please provide the mobile number"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  companyName: yup.string().trim().required("Please provide the company name"),
  designation: yup.string().trim().required("Please provide your designation"),
  urls: yup
    .string()
    .trim()
    .required("Please provide the URLs or links for content removal"),
  source: yup
    .string()
    .trim()
    .oneOf(["nomad", "host"], "Source must be either 'nomad' or 'host'")
    .required("Please provide the Source"),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiVisaSupportSchema = yup.object({
  visaType: yup.string().trim().required("Visa type is required"),
  fullName: yup.string().trim().required("Full name is required"),
  nationality: yup.string().trim().required("Nationality is required"),
  travellingCountry: yup
    .string()
    .trim()
    .required("Travelling country is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiOverallActivationSupportSchema = yup.object({
  supportRequired: yup.string().trim().required("Support required is required"),
  fullName: yup.string().trim().required("Full name is required"),
  nationalityOnPassport: yup
    .string()
    .trim()
    .required("Nationality on passport is required"),
  travelCountry: yup.string().trim().required("Travel country is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiNewCompanySetupSchema = yup.object({
  supportRequired: yup.string().trim().required("Support required is required"),
  fullName: yup.string().trim().required("Full name is required"),
  currentCompanyCountry: yup
    .string()
    .trim()
    .required("Current company country is required"),
  newCompanyCountry: yup
    .string()
    .trim()
    .required("New company country is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiConsultationSchema = yup.object({
  supportRequired: yup.string().trim().required("Support required is required"),
  fullName: yup.string().trim().required("Full name is required"),
  currentCountry: yup.string().trim().required("Current country is required"),
  consultationCountry: yup
    .string()
    .trim()
    .required("Consultation country is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiWorkationSchema = yup.object({
  noOfPeople: yup.string().trim().required("Number of people is required"),
  fullName: yup.string().trim().required("Full name is required"),
  companyName: yup.string().trim().required("Company name is required"),
  companyWebsite: yup.string().trim().required("Company website is required"),
  currentCountry: yup.string().trim().required("Current country is required"),
  workationCountry: yup
    .string()
    .trim()
    .required("Workation country is required"),
  startDate: yup.string().trim().required("Start date is required"),
  endDate: yup.string().trim().required("End date is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const aiBecomeContributorSchema = yup.object({
  contributionType: yup
    .string()
    .trim()
    .required("Contribution type is required"),
  fullName: yup.string().trim().required("Full name is required"),
  currentCountry: yup.string().trim().required("Current country is required"),
  linkedinProfile: yup.string().trim().required("Linkedin profile is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email address")
    .required("Please provide your email address"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  message: yup
    .string()
    .trim()
    .max(
      AI_CONTRIBUTOR_MESSAGE_CHARACTER_LIMIT,
      `Message cannot exceed ${AI_CONTRIBUTOR_MESSAGE_CHARACTER_LIMIT} characters`,
    )
    .nullable(),
  sheetName: yup.string().required("Please provide a sheet name"),
});

function toISODateOnly(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const addB2CformSubmission = async (req, res, next) => {
  let responseSent = false;

  try {
    const { B2C_APPS_SCRIPT_URL } = process.env;
    const { sheetName } = req.body;
    const isFastResponseSheet = AI_FAST_RESPONSE_SHEETS.has(sheetName);

    if (!B2C_APPS_SCRIPT_URL && !isFastResponseSheet) {
      throw new Error("B2C_APPS_SCRIPT_URL is not configured");
    }

    const isJobApp = sheetName === "Job_Application";

    if (isJobApp) {
      const payload = await jobApplicationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { submissionDate, submissionTime } = istNowPieces();

      if (!req.file) {
        return res.status(400).json({
          message: "Please upload your resume before submitting.",
        });
      }

      const data = await uploadFileToS3(
        `job-applications/${payload.jobPosition}/${
          payload.name
        }_${randomUUID()}/${req.file.originalname}`,
        req.file,
      );
      const resumeLink = data.url;

      // Post to Google Apps Script
      const apsBody = {
        formName: "jobApplication",
        ...payload,
        submissionDate,
        submissionTime,
        resumeLink,
      };

      const resp = await fetch(B2C_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apsBody),
      });

      const result = await resp.text();
      try {
        const json = JSON.parse(result);
        if (json.status !== "success")
          throw new Error(json.message || "Failed to save job application");

        await sendMail({
          to: payload.email,
          subject: `Application Received for ${payload.jobPosition}`,
          text: `Hi ${payload.name}, your application for ${payload.jobPosition} has been received.`,
          html: `
            <h2>Application Received</h2>
            <p>Hi ${payload.name},</p>
            <p>Thank you for applying for the position of <b>${payload.jobPosition}</b>.</p>
            <p>Our HR team will review your profile and get back to you soon.</p>
             <p>Cheers,<br/>The WONO Team</p>
          `,
        });

        await sendAdminFormNotification({
          subject: "New job application submitted",
          formName: sheetName,
          data: apsBody,
        });

        return res.status(201).json({
          status: "success",
          message: "Job application submitted successfully",
          submissionDate,
          submissionTime,
        });
      } catch {
        throw new Error(result || "Upstream script error");
      }
    }

    const {
      companyName,
      companyId,
      company,
      companyType,
      country,
      state,
      fullName,
      personelCount,
      phone,
      email,
      source,
      productType,
      startDate,
      endDate,
      name,
    } = req.body;
    // Configuration for each sheet type
    const sheetConfig = {
      All_Enquiry: {
        schema: enquirySchema,
        map: (d) => ({
          companyName: d.companyName,
          verticalType: d.companyType,
          country: d.country || "",
          state: d.state || "",
          fullName: d.fullName,
          noOfPeople: d.personelCount,
          mobileNumber: d.phone,
          email: d.email,
          startDate: toISODateOnly(d.startDate),
          endDate: toISODateOnly(d.endDate),
          source: d.source,
          productType: d.productType,
          sheetName: d.sheetName,
        }),
        successMsg: "Your enquiry has been sent.",
        emailTemplate: (data) => {
          const { submittedDate, submittedTime } = formatSubmittedOn(
            data.submittedAt ? new Date(data.submittedAt) : new Date(),
          );
          const referenceId = data.referenceId || "-";

          return {
            to: data.email,
            subject: "Your enquiry has been received",
            text: `Hi ${data.fullName}, your enquiry for ${data.companyName} has been successfully submitted. Reference ID: ${referenceId}. Our team will reach out shortly.`,
            html: renderNotificationEmail({
              heroTitle: "Thank You!",
              heroSubtitle: "We've successfully received your enquiry.",
              greetingHtml: `
                <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
                <p class="email-text" style="margin:0;">Thank you for your interest in <b class="email-heading">${data.companyName}</b>.</p>
              `,
              referenceLabel: "Reference ID",
              referenceValue: referenceId,
              detailsTitle: "Your Details",
              detailRows: [
                ["Full Name", data.fullName],
                ["No. Of People", data.noOfPeople],
                ["Phone", data.mobileNumber],
                ["Email", data.email],
                ["Product", data.companyName],
                ["Start Date", toDMY(data.startDate)],
                ["End Date", toDMY(data.endDate)],
                ["Submitted On", `${submittedDate}<br/>${submittedTime}`],
              ],
              whatNextTitle: "What Happens Next?",
              whatNextItems: [
                "Our team will review your enquiry.",
                "We will contact you within 24 business hours.",
                "If additional information is required, we will get in touch.",
              ],
            }),
          };
        },
      },
      All_POC_Contact: {
        schema: pocSchema,
        map: (d) => ({
          pocName: d.pocName,
          pocCompany: d.pocCompany,
          pocDesignation: d.pocDesignation,
          fullName: d.fullName,
          mobile: d.mobile,
          email: d.email,
          sheetName: d.sheetName,
        }),
        successMsg: "Message sent successfully",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Your POC Request Has Been Sent",
          text: `Hi ${data.fullName}, your request to connect with ${data.pocName} has been submitted successfully.`,
          html: renderNotificationEmail({
            heroTitle: "Request Sent!",
            heroSubtitle: "Your POC request has been shared.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Your request to connect with <b class="email-heading">${data.pocName}</b> has been submitted successfully. They will reach out to you soon.</p>
            `,
            detailsTitle: "Contact Details",
            detailRows: [
              ["Contact Person", data.pocName],
              ["Designation", data.pocDesignation],
              ["Company", data.pocCompany],
            ],
            whatNextTitle: "What Happens Next?",
            whatNextItems: [
              "Your request has been shared with the contact.",
              "They will review your details.",
              "You can expect a response soon.",
            ],
          }),
        }),
      },
      Connect_with_us: {
        schema: connectWithUsSchema,
        map: (d) => ({
          name: d.name,
          email: d.email,
          mobile: d.mobile,
          typeOfPartnerShip: d.typeOfPartnerShip,
          message: d.message,
          sheetName: d.sheetName,
        }),
        successMsg: "A new contact enquiry added successfully.",
        emailTemplate: (d) => ({
          to: d.email,
          subject: "We Received Your Message",
          text: `Hi ${d.name}, we've received your message regarding ${d.typeOfPartnerShip}.`,
          html: renderNotificationEmail({
            heroTitle: "Message Received!",
            heroSubtitle: "Thank you for connecting with WONO.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${d.name},</p>
              <p class="email-text" style="margin:0;">We've received your message regarding <b class="email-heading">${d.typeOfPartnerShip}</b>. Our team will respond shortly.</p>
            `,
            detailsTitle: "Enquiry Details",
            detailRows: [["Type of Partnership", d.typeOfPartnerShip]],
            whatNextTitle: "What Happens Next?",
            whatNextItems: [
              "Our team will review your message.",
              "We'll get back to you shortly.",
            ],
          }),
        }),
      },
      Sign_up: {
        schema: nomadsSignupSchema,
        map: (d) => {
          const parsedMobile = parsePhoneNumberFromString(d.mobile || "");
          const contactCode = parsedMobile?.countryCallingCode
            ? `+${parsedMobile.countryCallingCode}`
            : "";
          const contactNumber = parsedMobile?.nationalNumber || "";
          const normalizedFullName =
            d.fullName?.trim() ||
            `${d.firstName || ""} ${d.lastName || ""}`.trim();
          return {
            fullName: normalizedFullName,
            countryOfResidence:
              d.countryOfResidence?.trim() || d.country?.trim() || "",
            country: d.countryOfResidence?.trim() || d.country?.trim() || "",
            email: d.email?.trim(),
            password: d.password,
            contactCode: contactCode,
            contactNumber: contactNumber,
            sheetName: d.sheetName,
            submittedAt: new Date(),
          };
        },
        successMsg: "Sign-up saved successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Welcome to WONO!",
          text: `Hi ${data.fullName}, welcome to WONO! Your Nomad signup is successful.`,
          html: renderNotificationEmail({
            heroTitle: "Welcome to WONO!",
            heroSubtitle: "Your Nomad signup is successful.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for signing up with WONO.</p>
              <p class="email-text" style="margin:8px 0 0;">We're excited to welcome you to the WONO Nomad community.</p>
            `,
            bodyHtml: `
              <tr>
                <td style="padding:28px 32px 4px;text-align:center;">
                  <p style="margin:0 0 12px;font-size:12px;font-weight:600;letter-spacing:0.5px;color:#0BA9EF;text-transform:uppercase;">Start Your Journey</p>
                  <a href="https://www.wono.co" style="display:inline-block;background:#0BA9EF;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;padding:13px 32px;border-radius:8px;">Explore WONO &#8594;</a>
                </td>
              </tr>
            `,
          }),
        }),
      },
      Content_Removal_Requests: {
        schema: contentRemovalRequestsSchema,
        map: (d) => ({
          fullName: d.fullName,
          mobile: d.mobile,
          email: d.email,
          companyName: d.companyName,
          designation: d.designation,
          urls: d.urls,
          source: d.source,
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg:
          "Your content removal request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Content Removal Request Received",
          text: `Hi ${data.fullName}, we've received your content removal request for ${data.companyName}. Our moderation team will review it shortly.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your content removal request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">We've received your content removal request for <b class="email-heading">${data.companyName}</b>. Our team will review the provided URLs and take the necessary action.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Company", data.companyName],
              ["Designation", data.designation],
            ],
            noteHtml:
              "We'll get back to you via email if we need additional details.",
          }),
        }),
      },
      AI_Visa_Support: {
        schema: aiVisaSupportSchema,
        map: (d) => ({
          visaType: d.visaType,
          fullName: d.fullName,
          nationality: d.nationality,
          travellingCountry: d.travellingCountry,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          comments: d.comments || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg:
          "Your visa support request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Visa Support Request Received",
          text: `Hi ${data.fullName}, we have received your visa support request for ${data.travellingCountry}.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your visa support request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your request for <b class="email-heading">${data.travellingCountry}</b>. Our team has received your details and will get back to you shortly with the next steps.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Visa Type", data.visaType],
              ["Nationality", data.nationality],
              ["Travelling To", data.travellingCountry],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
      AI_Overall_Activation_Support: {
        schema: aiOverallActivationSupportSchema,
        map: (d) => ({
          supportRequired: d.supportRequired,
          fullName: d.fullName,
          nationalityOnPassport: d.nationalityOnPassport,
          travelCountry: d.travelCountry,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          comments: d.comments || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg:
          "Your Activation Support request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Activation Support Request Received",
          text: `Hi ${data.fullName}, we have received your activation support request for ${data.travelCountry}.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your activation support request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your request for <b class="email-heading">${data.travelCountry}</b>. Our team has received your details and will get back to you shortly.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Support Required", data.supportRequired],
              ["Nationality (Passport)", data.nationalityOnPassport],
              ["Travel Country", data.travelCountry],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
      AI_New_Company_Setup: {
        schema: aiNewCompanySetupSchema,
        map: (d) => ({
          supportRequired: d.supportRequired,
          fullName: d.fullName,
          currentCompanyCountry: d.currentCompanyCountry,
          newCompanyCountry: d.newCompanyCountry,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          comments: d.comments || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg:
          "Your new company setup request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Company Setup Request Received",
          text: `Hi ${data.fullName}, we have received your new company setup request for ${data.newCompanyCountry}.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your company setup request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your request to set up in <b class="email-heading">${data.newCompanyCountry}</b>. Our team has received your details and will get back to you shortly.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Support Required", data.supportRequired],
              ["Current Country", data.currentCompanyCountry],
              ["New Company Country", data.newCompanyCountry],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
      AI_Consultation: {
        schema: aiConsultationSchema,
        map: (d) => ({
          supportRequired: d.supportRequired,
          fullName: d.fullName,
          currentCountry: d.currentCountry,
          consultationCountry: d.consultationCountry,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          comments: d.comments || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg:
          "Your consultation request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Consultation Request Received",
          text: `Hi ${data.fullName}, we have received your consultation request for ${data.consultationCountry}.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your consultation request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your consultation request for <b class="email-heading">${data.consultationCountry}</b>. Our team has received your details and will get back to you shortly.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Support Required", data.supportRequired],
              ["Current Country", data.currentCountry],
              ["Consultation Country", data.consultationCountry],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
      AI_Workation: {
        schema: aiWorkationSchema,
        map: (d) => ({
          noOfPeople: d.noOfPeople,
          fullName: d.fullName,
          companyName: d.companyName,
          companyWebsite: d.companyWebsite,
          currentCountry: d.currentCountry,
          workationCountry: d.workationCountry,
          startDate: d.startDate,
          endDate: d.endDate,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          comments: d.comments || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg: "Your workation request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Workation Request Received",
          text: `Hi ${data.fullName}, we have received your workation request for ${data.workationCountry}.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Your workation request is being reviewed.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your workation request for <b class="email-heading">${data.workationCountry}</b>. Our team has received your details and will get back to you shortly.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Company", data.companyName],
              ["Current Country", data.currentCountry],
              ["Workation Country", data.workationCountry],
              ["No. Of People", data.noOfPeople],
              ["Start Date", formatLongDate(data.startDate)],
              ["End Date", formatLongDate(data.endDate)],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
      AI_Become_Contributor: {
        schema: aiBecomeContributorSchema,
        map: (d) => ({
          contributionType: d.contributionType,
          fullName: d.fullName,
          currentCountry: d.currentCountry,
          linkedinProfile: d.linkedinProfile,
          email: d.email,
          contactCode: d.contactCode,
          contactNumber: d.contactNumber,
          message: d.message || "",
          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg: "Your contributor request has been submitted successfully.",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Contributor Request Received",
          text: `Hi ${data.fullName}, we have received your contributor request.`,
          html: renderNotificationEmail({
            heroTitle: "Request Received!",
            heroSubtitle: "Thank you for your interest in contributing to WONO.",
            greetingHtml: `
              <p style="margin:0 0 4px;">Hello ${data.fullName},</p>
              <p class="email-text" style="margin:0;">Thank you for your interest in contributing to WONO. Our team has received your details and will get back to you shortly.</p>
            `,
            detailsTitle: "Request Details",
            detailRows: [
              ["Contribution Type", data.contributionType],
              ["Current Country", data.currentCountry],
              ["LinkedIn", data.linkedinProfile],
              ["Contact Number", `${data.contactCode || ""} ${data.contactNumber || ""}`.trim()],
            ],
          }),
        }),
      },
    };

    const config = sheetConfig[sheetName];
    if (!config) {
      throw new Error(`Unsupported sheet name: ${sheetName}`);
    }

    // Validate request
    const validatedData = await config.schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Build payload
    const payload = config.map(validatedData);

    if (isFastResponseSheet) {
      responseSent = true;
      res.status(201).json({
        status: "success",
        message: config.successMsg,
        data: payload,
      });

      setImmediate(async () => {
        try {
          if (sheetName === "AI_Visa_Support") {
            await VisaSupport.create({
              visaType: payload.visaType,
              fullName: payload.fullName,
              nationality: payload.nationality,
              travellingCountry: payload.travellingCountry,
              email: payload.email,
              contactCode: payload.contactCode,
              contactNumber: payload.contactNumber,
              comments: payload.comments,
            });
          }

          if (sheetName === "AI_Overall_Activation_Support") {
            await OverallActivationSupport.create(payload);
          }

          if (sheetName === "AI_New_Company_Setup") {
            await NewCompanySetup.create(payload);
          }

          if (sheetName === "AI_Consultation") {
            await Consultation.create(payload);
          }

          if (sheetName === "AI_Workation") {
            await Workation.create(payload);
          }

          if (sheetName === "AI_Become_Contributor") {
            await BecomeContributor.create(payload);
          }

          let sheetsWarning = null;
          const result = B2C_APPS_SCRIPT_URL
            ? await fetch(B2C_APPS_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }).then((response) => response.json())
            : {
                status: "error",
                message: "B2C_APPS_SCRIPT_URL is not configured",
              };

          if (result.status !== "success") {
            const upstreamMessage =
              result.message || "Failed to save data to Google Sheets";
            const normalizedMessage =
              typeof upstreamMessage === "string"
                ? upstreamMessage.toLowerCase()
                : "";
            const isSheetConfigIssue =
              normalizedMessage === "invalid sheetname" ||
              normalizedMessage === "sheet not found";

            if (isSheetConfigIssue) {
              sheetsWarning = `Google Sheets sync skipped for "${payload.sheetName}". Please add this sheetName in Apps Script sheetConfigs and create the sheet tab.`;
            } else {
              throw new Error(upstreamMessage);
            }
          }

          if (sheetsWarning) {
            console.warn(sheetsWarning);
          }

          if (config.emailTemplate) {
            const emailContent = config.emailTemplate(payload);

            await sendMail({
              to: emailContent.to,
              subject: emailContent.subject,
              html: emailContent.html,
            });
          }

          await sendAdminFormNotification({
            subject: "New form submission received",
            formName: sheetName,
            data: payload,
          });
        } catch (error) {
          console.error(
            `Background submission processing failed for ${sheetName}:`,
            error.message,
          );
        }
      });

      return;
    }

    if (sheetName === "All_Enquiry") {
      if (company && !mongoose.Types.ObjectId.isValid(company)) {
        return res.status(400).json({ message: "Invalid company id provided" });
      }

      const leads = new Lead({
        ...payload,
        company,
        companyId,
        isEscalated: false,
      });

      await leads.save();

      const totalLeads = await Lead.countDocuments({});
      payload.referenceId = `WN-${referenceDateStamp(leads.createdAt)}-${String(
        totalLeads,
      ).padStart(5, "0")}`;
      payload.submittedAt = leads.createdAt || new Date();
    }

    if (sheetName === "Sign_up") {
      const existingUser = await NomadUser.findOne({
        email: req.body.email?.trim().toLowerCase(),
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const { email, mobile, password, confirmPassword } = req.body;

      if (!email || !password || !mobile || !confirmPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (password.length < 6) {
        return res
          .status(409)
          .json({ message: "Password must be 6 characters long" });
      }

      if (confirmPassword !== password) {
        return res.status(400).json({ message: "Please match the password" });
      }

      const signupEntry = new NomadUser(payload);

      await signupEntry.save();
    }

    if (sheetName === "AI_Visa_Support") {
      await VisaSupport.create({
        visaType: payload.visaType,
        fullName: payload.fullName,
        nationality: payload.nationality,
        travellingCountry: payload.travellingCountry,
        email: payload.email,
        contactCode: payload.contactCode,
        contactNumber: payload.contactNumber,
        comments: payload.comments,
      });
    }

    if (sheetName === "AI_Overall_Activation_Support") {
      await OverallActivationSupport.create(payload);
    }

    if (sheetName === "AI_New_Company_Setup") {
      await NewCompanySetup.create(payload);
    }

    if (sheetName === "AI_Consultation") {
      await Consultation.create(payload);
    }

    if (sheetName === "AI_Workation") {
      await Workation.create(payload);
    }

    if (sheetName === "AI_Become_Contributor") {
      await BecomeContributor.create(payload);
    }

    let sheetsWarning = null;

    // Send to Google Apps Script
    const result = B2C_APPS_SCRIPT_URL
      ? await fetch(B2C_APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((response) => response.json())
      : {
          status: "error",
          message: "B2C_APPS_SCRIPT_URL is not configured",
        };

    if (result.status !== "success") {
      const upstreamMessage =
        result.message || "Failed to save data to Google Sheets";
      const normalizedMessage =
        typeof upstreamMessage === "string"
          ? upstreamMessage.toLowerCase()
          : "";
      const isSheetConfigIssue =
        normalizedMessage === "invalid sheetname" ||
        normalizedMessage === "sheet not found";

      const ALLOWED_AI_SHEETS_WITH_OPTIONAL_APPS_SCRIPT_CONFIG = new Set([
        "AI_Visa_Support",
        "AI_Overall_Activation_Support",
        "AI_New_Company_Setup",
        "AI_Consultation",
        "AI_Workation",
        "AI_Become_Contributor",
      ]);

      if (
        ALLOWED_AI_SHEETS_WITH_OPTIONAL_APPS_SCRIPT_CONFIG.has(sheetName) &&
        isSheetConfigIssue
      ) {
        sheetsWarning = `Google Sheets sync skipped for "${payload.sheetName}". Please add this sheetName in Apps Script sheetConfigs and create the sheet tab.`;
      } else if (normalizedMessage === "invalid sheetname") {
        throw new Error(
          `Google Sheets sync failed: sheetName "${payload.sheetName}" is not configured in Apps Script sheetConfigs.`,
        );
      } else {
        throw new Error(upstreamMessage);
      }
    }

    // send email if template exists
    if (config.emailTemplate) {
      const emailContent = config.emailTemplate(payload);

      await sendMail({
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    await sendAdminFormNotification({
      subject: "New form submission received",
      formName: sheetName,
      data: payload,
    });

    if (responseSent) return;
    res.status(201).json({
      status: "success",
      message: config.successMsg,
      data: payload,
      ...(sheetsWarning ? { warning: sheetsWarning } : {}),
    });
  } catch (err) {
    console.error("❌ Error in addB2CformSubmission:", err.message);
    console.error(err.stack);

    if (err.name === "ValidationError") {
      if (responseSent) return;
      return res.status(400).json({
        message: err.errors[0], // only the first message
      });
    }
    if (responseSent) return;
    next(err);
  }
};
