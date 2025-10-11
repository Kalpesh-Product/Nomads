import * as yup from "yup";
import Lead from "../../models/Lead.js";
import mongoose from "mongoose";
import { sendMail } from "../../config/mailer.js"; // adjust path if different
import User from "../../models/NomadUser.js";
import NomadUser from "../../models/NomadUser.js";
import bcrypt from "bcrypt";

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
    .matches(/^\+?[0-9]{7,15}$/, "Please provide a valid phone number")
    .required("Please provide your phone number"),
  startDate: yup
    .date()
    .typeError("Please provide a valid start date")
    .required("Please provide the start date"),
  endDate: yup
    .date()
    .typeError("Please provide a valid end date")
    .min(yup.ref("startDate"), "End date cannot be before the start date")
    .required("Please provide the end date"),
  source: yup
    .string()
    .trim()
    .min(1, "Please provide a valid the source")
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
    .matches(/^\+?[0-9]{7,15}$/, "Please provide a valid mobile number")
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
  mobile: yup.string().trim().required("Please provide the mobile"),
  typeOfPartnerShip: yup
    .string()
    .required("Please provide the type of partnership."),
  message: yup.string().required("Please provide a brief messsage."),
  sheetName: yup.string().required("Please provide a sheet name"),
});

const nomadsSignupSchema = yup.object().shape({
  firstName: yup.string().required("Please provide your first name"),
  lastName: yup.string().required("Please provide your last name"),
  email: yup
    .string()
    .email("Please provide a valid email")
    .required("Please provide your email"),
  password: yup.string().optional(),
  mobile: yup.string().trim().required("Please provide the mobile"),

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
  try {
    const { B2C_APPS_SCRIPT_URL } = process.env;
    if (!B2C_APPS_SCRIPT_URL) {
      throw new Error("B2C_APPS_SCRIPT_URL is not configured");
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
      sheetName,
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
        successMsg: "Enquiry added successfully",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Your enquiry has been received ✅",
          text: `Hi ${data.fullName}, your enquiry has been sent to the company successfully.`,
          html: `
        <h2>Thank you for your enquiry</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your enquiry for <b>${data.companyName}</b> has been successfully submitted. Our team will reach out shortly.</p>
        <p>Cheers,<br/>The WONO Team</p>
      `,
        }),
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
        successMsg: "POC added successfully",
        emailTemplate: (data) => ({
          to: data.email,
          subject: "Your POC request has been sent 📩",
          text: `Hi ${data.fullName}, your POC contact request has been shared.`,
          html: `
        <h2>POC Contacted</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your request to connect with <b>${data.pocName}</b> (${data.pocDesignation} at ${data.pocCompany}) has been submitted successfully.</p>
        <p>They will reach out to you soon.</p>
        <p>Cheers,<br/>The WONO Team</p>
      `,
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
      },
      Sign_up: {
        schema: nomadsSignupSchema,
        map: (d) => ({
          firstName: d.firstName?.trim(),
          lastName: d.lastName?.trim(),
          email: d.email?.trim(),
          password: d.password,

          mobile: d.mobile?.trim(),

          sheetName: d.sheetName,
          submittedAt: new Date(),
        }),
        successMsg: "Sign-up saved successfully.",
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

    if (sheetName === "All_Enquiry") {
      if (company && !mongoose.Types.ObjectId.isValid(company)) {
        return res.status(400).json({ message: "Invalid company id provided" });
      }

      const leads = new Lead({
        companyName,
        company,
        companyId,
        verticalType: companyType,
        country: country || "",
        state: state || "",
        fullName,
        noOfPeople: personelCount,
        mobileNumber: phone,
        email,
        source,
        productType,
        startDate: toISODateOnly(startDate),
        endDate: toISODateOnly(endDate),
        sheetName,
      });

      await leads.save();
    }

    if (sheetName === "Sign_up") {
      console.log(sheetName);
      const existingUser = await NomadUser.findOne({
        email: req.body.email?.trim().toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const { email, mobile, password, confirmPassword } = req.body;

      if (!email || !password || !mobile) {
        return res.status(409).json({ message: "Missing required fields" });
      }

      if (confirmPassword !== password) {
        return res.status(400).json({ message: "Please match the password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const signupEntry = new NomadUser({
        firstName: req.body.firstName?.trim(),
        lastName: req.body.lastName?.trim(),
        email: email?.trim().toLowerCase(),
        password: hashedPassword,
        country: req.body.country?.trim(),
        state: req.body.state?.trim(),
        mobile: mobile?.trim(),
      });

      await signupEntry.save();
    }

    // Send to Google Apps Script
    const response = await fetch(B2C_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to save data to Google Sheets");
    }

    // Send confirmation email if template exists
    // if (config.emailTemplate) {
    //   try {
    //     await sendMail(config.emailTemplate(validatedData));
    //   } catch (err) {
    //     console.error("Failed to send confirmation email:", err.message);
    //   }
    // }

    try {
      const { firstName, lastName, email } = req.body;
      const name = `${firstName} ${lastName}`;
      await sendMail({
        to: email,
        subject: "Welcome to WONO Nomads 🎉",
        text: `Hi ${name || "User"}, thanks for registering with WONO Nomads!`,
        html: `
         <h2>Welcome to WONO Nomads</h2>
            <p>Hi ${payload.name || "User"},</p>
              <p>We’re thrilled to have you with us.</p>
    <p>Start exploring and connecting with fellow nomads today.</p>
            <p>Cheers,<br/>The WONO Team</p>
          `,
      });
      console.log("✅ Registration email sent to", email);
    } catch (err) {
      console.error("❌ Failed to send email:", err.message);
    }

    res.status(201).json({
      status: "success",
      message: config.successMsg,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
};
