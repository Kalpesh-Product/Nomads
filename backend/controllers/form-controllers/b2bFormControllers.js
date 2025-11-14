import { uploadFileToS3 } from "../../config/s3Config.js";
import { randomUUID } from "crypto";
import yup from "yup";
import mongoose from "mongoose";
import WebsiteTemplate from "../../models/WebsiteTemplate.js";
import sharp from "sharp";
import { sendMail } from "../../config/mailer.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const istNowPieces = () => {
  const tz = "Asia/Kolkata";
  const now = new Date();
  // en-CA -> yyyy-mm-dd
  const submissionDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // 24h HH:mm:ss
  const submissionTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\u202F/g, ""); // fix narrow no-break space on some Node versions

  return { submissionDate, submissionTime };
};

const jobApplicationSchema = yup
  .object({
    jobPosition: yup.string().trim().required("Job Position is required"),
    name: yup.string().trim().required("Name is required"),
    email: yup.string().trim().email().required("Valid email is required"),
    dob: yup
      .string()
      .trim()
      .nullable()
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of Birth must be YYYY-MM-DD (use 0-padding)"
      ),
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
        }
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
    joinInDays: yup
      .string()
      .typeError("How Soon You Can Join (Days) must be a number")
      .min(0)
      .required("Join-in days is required"),
    relocateGoa: yup
      .string()
      .trim()
      .oneOf(["Yes", "No"], "Relocate must be 'Yes' or 'No'")
      .required("Relocate to Goa is required"),
    personality: yup.string().trim().required("Tell us about yourself"),
    skills: yup.string().trim().required("Skills are required"),
    whyConsider: yup
      .string()
      .trim()
      .required("Why should we consider you is required"),
    willingToBootstrap: yup
      .string()
      .trim()
      .required("Willing to bootstrap is required"),
    message: yup.string().trim().nullable(),
    remarks: yup.string().trim().default(""),
    submissionDate: yup
      .string()
      .trim()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Submission Date must be YYYY-MM-DD")
      .optional(),
    submissionTime: yup
      .string()
      .trim()
      .matches(/^\d{2}:\d{2}:\d{2}$/, "Submission Time must be HH:mm:ss")
      .optional(),
  })
  .noUnknown(true, "Unknown field in payload");

const enquirySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  mobile: yup
    .string()
    .trim()
    .required("Mobile number is required")
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
      }
    ),
  // .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

  partnerstype: yup.string().trim().required("Partner Type is required"),

  message: yup
    .string()
    .trim()
    .required("Message is required")
    .min(5, "Message must be at least 5 characters long"),

  formName: yup.string().trim().required("Form Name is required"),
});

// controllers/b2bFormController.js

export const addB2BFormSubmission = async (req, res, next) => {
  const url = process.env.B2B_APPS_SCRIPT_URL;
  if (!url) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: Web App URL not set" });
  }

  // --- shared helpers -------------------------------------------------------

  const validate = async (schema, body) => {
    return schema.validate(body, { abortEarly: false, stripUnknown: true });
  };

  const addIstSubmissionStampsIfMissing = (payload) => {
    const { submissionDate, submissionTime } = istNowPieces();
    if (!payload.submissionDate) payload.submissionDate = submissionDate;
    if (!payload.submissionTime) payload.submissionTime = submissionTime;
    return payload;
  };

  const parseAppsScriptResponse = async (resp) => {
    const text = await resp.text();
    try {
      return { ok: resp.ok, data: JSON.parse(text) };
    } catch {
      return { ok: resp.ok, data: { raw: text } };
    }
  };

  const postToAppsScript = async (body) => {
    const signal =
      typeof AbortSignal?.timeout === "function"
        ? AbortSignal.timeout(15_000)
        : undefined;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    const { ok, data } = await parseAppsScriptResponse(resp);
    if (!ok || data?.error) {
      const detail = data?.error || data?.raw || "Unknown upstream error";
      const err = new Error("Upstream write failed");
      err.status = 502;
      err.detail = detail;
      throw err;
    }
    return data;
  };

  // --- individual form handlers --------------------------------------------

  const handleJobApplication = async () => {
    // 1) validate + coerce
    const payload = await validate(jobApplicationSchema, req.body);

    // 2) ensure IST stamps if missing
    addIstSubmissionStampsIfMissing(payload);

    // 3) optional resume upload
    let resumeLink = "";
    if (req.file) {
      data = await uploadFileToS3(
        `job-applications/${payload.jobPosition}/${
          payload.name + randomUUID()
        }/${req.file.originalname}`,
        req.file
      );

      resumeLink = data.url;
    }

    // 4) forward to Apps Script
    const apsBody = {
      formName: "jobApplication",
      jobPosition: payload.jobPosition,
      name: payload.name,
      email: payload.email,
      dob: payload.dob ?? "",
      mobile: payload.mobile,
      location: payload.location,
      experienceYears: payload.experienceYears,
      linkedin: payload.linkedin ?? "",
      currentMonthlySalary: payload.currentMonthlySalary ?? "",
      expectedMonthlySalary: payload.expectedMonthlySalary ?? "",
      joinInDays: payload.joinInDays,
      relocateGoa: payload.relocateGoa,
      personality: payload.personality,
      skills: payload.skills,
      whyConsider: payload.whyConsider,
      willingToBootstrap: payload.willingToBootstrap,
      message: payload.message ?? "",
      submissionDate: payload.submissionDate,
      submissionTime: payload.submissionTime,
      resumeLink,
      remarks: payload.remarks ?? "",
    };

    await postToAppsScript(apsBody);

    try {
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
      console.log("✅ Application email sent to", payload.email);
    } catch (err) {
      console.error("❌ Failed to send email:", err.message);
    }

    // 5) response
    return res.status(201).json({
      message: "Application submitted",
      submissionDate: payload.submissionDate,
      submissionTime: payload.submissionTime,
    });
  };

  const handleEnquiry = async () => {
    const payload = await validate(enquirySchema, req.body);

    const apsBody = {
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      partnerstype: payload.partnerstype,
      message: payload.message,
      formName: "connect",
    };

    const result = await postToAppsScript(apsBody);

    await sendMail({
      to: payload.email,
      subject: "We Received Your Message",
      html: `
        <h2>Thank You For Connecting</h2>
        <p>Hi ${payload.name},</p>
        <p>We’ve received your message regarding <b>${payload.partnerstype}</b>.</p>
        <p>Our team will respond shortly.</p>
        <p>Cheers,<br/>The WONO Team</p>
      `,
    });

    return res.json(result);
  };

  // --- router-like dispatch -------------------------------------------------

  try {
    const formName = req.body?.formName;

    const handlers = {
      jobApplication: handleJobApplication,
      connect: handleEnquiry,
    };

    if (!formName || !handlers[formName]) {
      return res.status(400).json({
        error: "Unsupported form",
        detail: `Expected one of: ${Object.keys(handlers).join(", ")}`,
      });
    }

    await handlers[formName]();
  } catch (err) {
    // if (err?.name === "ValidationError") {
    //   const errors = err.inner?.length
    //     ? err.inner.reduce((acc, e) => {
    //         if (e.path && !acc[e.path]) acc[e.path] = e.message;
    //         return acc;
    //       }, {})
    //     : { message: err.message };
    //   return res.status(400).json({ error: "Validation failed", errors });
    // }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.errors[0], // only the first message
      });
    }

    if (err?.status === 502) {
      return res
        .status(502)
        .json({ error: "Upstream write failed", detail: err.detail });
    }

    return next(err);
  }
};

// controllers/registerController.js

export const registerFormSubmission = async (req, res) => {
  const url = process.env.B2B_APPS_SCRIPT_URL;
  if (!url) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: Web App URL not set" });
  }

  // --- helpers ------------------------------------------------------
  const parseAppsScriptResponse = async (resp) => {
    const text = await resp.text();
    try {
      return { ok: resp.ok, data: JSON.parse(text) };
    } catch {
      return { ok: resp.ok, data: { raw: text } };
    }
  };

  const postToAppsScript = async (body) => {
    const signal =
      typeof AbortSignal?.timeout === "function"
        ? AbortSignal.timeout(15_000)
        : undefined;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    const { ok, data } = await parseAppsScriptResponse(resp);
    if (!ok || data?.error) {
      const detail = data?.error || data?.raw || "Unknown upstream error";
      const err = new Error("Upstream write failed");
      err.status = 502;
      err.detail = detail;
      throw err;
    }

    return data;
  };

  try {
    const payload = req.body;

    try {
      const num = parsePhoneNumberFromString(payload.mobile);
      if (num?.isValid()) payload.mobile = num.number; // normalize
    } catch {}

    // STEP 1: send registration data to Google Sheet
    const apsBody = {
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      country: payload.country,
      city: payload.city,
      state: payload.state,
      companyName: payload.companyName,
      industry: payload.industry,
      companySize: payload.companySize,
      companyType: payload.companyType,
      companyCity: payload.companyCity,
      companyState: payload.companyState,
      websiteURL: payload.websiteUrl,
      linkedinURL: payload.linkedInUrl,
      selectedServices: payload.selectedServices,
      formName: "register",
    };

    const sheetResult = await postToAppsScript(apsBody);

    // STEP 2: normalize incoming JSON strings
    let { products, testimonials, about } = payload;
    const safeParse = (val, fallback) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val || fallback;
      } catch {
        return fallback;
      }
    };

    products = safeParse(products, []);
    testimonials = safeParse(testimonials, []);
    about = safeParse(about, []);

    for (const k of Object.keys(payload)) {
      if (/^(products|testimonials)\.\d+\./.test(k)) delete payload[k];
    }

    // ---------------- Website Data Save Logic ----------------
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const company = req.body.companyName || null;

      const formatCompanyName = (name) => {
        if (!name) return "";

        const trimmed = name.trim().toLowerCase();

        const invalids = ["n/a", "na", "none", "undefined", "null", "-"];
        if (invalids.includes(trimmed)) return "";

        return trimmed.split("-")[0].replace(/\s+/g, "");
      };

      const searchKey = formatCompanyName(payload.companyName);
      const baseFolder = `hosts/template/${searchKey}`;

      let template = {
        searchKey,
        companyName: payload.companyName,
        title: payload.title,
        subTitle: payload.subTitle,
        CTAButtonText: payload.CTAButtonText,
        about,
        productTitle: payload?.productTitle,
        galleryTitle: payload?.galleryTitle,
        testimonialTitle: payload.testimonialTitle,
        contactTitle: payload.contactTitle,
        mapUrl: payload.mapUrl,
        websiteEmail: payload.websiteEmail,
        phone: payload.phone,
        address: payload.address,
        registeredCompanyName: payload.registeredCompanyName,
        copyrightText: payload.copyrightText,
        products: [],
        testimonials: [],
        source: "Nomad",
      };

      // Helper: upload an array of files to S3
      const uploadImages = async (files = [], folder) => {
        const arr = [];
        for (const file of files) {
          const buffer = await sharp(file.buffer)
            .webp({ quality: 80 })
            .toBuffer();

          const route = `${folder}/${Date.now()}_${file.originalname.replace(
            /\s+/g,
            "_"
          )}`;
          const data = await uploadFileToS3(route, {
            buffer,
            mimetype: "image/webp",
          });
          arr.push({ url: data.url, id: data.id });
        }
        return arr;
      };

      // Index multer files
      const filesByField = {};
      for (const f of req.files || []) {
        if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
        filesByField[f.fieldname].push(f);
      }

      // IMAGE COUNT VALIDATION

      // Hero Images: max 5
      if (filesByField.heroImages && filesByField.heroImages.length > 5) {
        return res.status(400).json({
          error: "You can upload a maximum of 5 hero images.",
        });
      }

      // Gallery Images: max 40
      if (filesByField.gallery && filesByField.gallery.length > 40) {
        return res.status(400).json({
          error: "You can upload a maximum of 40 gallery images.",
        });
      }

      // Product Images: each product max 10
      for (const key of Object.keys(filesByField)) {
        if (key.startsWith("productImages_")) {
          const productNumber = Number(key.split("productImages_")[1]) + 1;

          const count = filesByField[key].length;
          if (count > 10) {
            return res.status(400).json({
              error: `Product ${productNumber} has ${count} images. Max allowed is 10.`,
            });
          }
        }
      }

      // companyLogo
      if (filesByField.companyLogo && filesByField.companyLogo[0]) {
        const logoFile = filesByField.companyLogo[0];
        const buffer = await sharp(logoFile.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        const route = `${baseFolder}/companyLogo/${Date.now()}_${
          logoFile.originalname
        }`;
        const data = await uploadFileToS3(route, {
          buffer,
          mimetype: "image/webp",
        });
        template.companyLogo = { url: data.url, id: data.id };
      }

      // heroImages
      if (filesByField.heroImages?.length) {
        template.heroImages = await uploadImages(
          filesByField.heroImages,
          `${baseFolder}/heroImages`
        );
      }

      // gallery
      if (filesByField.gallery?.length) {
        template.gallery = await uploadImages(
          filesByField.gallery,
          `${baseFolder}/gallery`
        );
      }

      // products
      if (Array.isArray(products) && products.length) {
        for (let i = 0; i < products.length; i++) {
          const p = products[i] || {};
          const pFiles = filesByField[`productImages_${i}`] || [];
          const uploaded = await uploadImages(
            pFiles,
            `${baseFolder}/productImages/${i}`
          );

          template.products.push({
            type: p.type,
            name: p.name,
            cost: p.cost,
            description: p.description,
            images: uploaded,
          });
        }
      }

      // testimonials
      let tUploads = [];
      if (filesByField.testimonialImages?.length) {
        tUploads = await uploadImages(
          filesByField.testimonialImages,
          `${baseFolder}/testimonialImages`
        );
      } else {
        for (let i = 0; i < testimonials.length; i++) {
          const tFiles = filesByField[`testimonialImages_${i}`] || [];
          const uploaded = await uploadImages(
            tFiles,
            `${baseFolder}/testimonialImages/${i}`
          );

          tUploads[i] = uploaded[0];
        }
      }

      template.testimonials = (testimonials || []).map((t, i) => ({
        image: tUploads[i],
        name: t.name,
        jobPosition: t.jobPosition,
        testimony: t.testimony,
        rating: t.rating,
      }));

      // STEP 3: send Mongo saved data to external API
      let websiteResult = "";

      if (searchKey) {
        try {
          const submit = await fetch(
            `https://wonomasterbe.vercel.app/api/editor/create-website`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(template),
            }
          );
          const raw = await submit.text();
          try {
            websiteResult = JSON.parse(raw);
          } catch {
            console.error("Non-JSON response:", raw);
            websiteResult = { message: "Invalid JSON response", raw };
          }

          await session.commitTransaction();
          session.endSession();
        } catch (err) {
          console.error("create-template call failed:", err);
          websiteResult = { message: "create-template call failed" };
        }
      }

      // STEP 5: send confirmation email to user
      if (payload.email) {
        try {
          await sendMail({
            to: payload.email,
            subject: "Welcome to WONO Nomads 🎉",
            text: `Hi ${
              payload.name || "User"
            }, thanks for registering with WONO Nomads!`,
            html: `
            <h2>Welcome to WONO Nomads</h2>
            <p>Hi ${payload.name || "User"},</p>
            <p>Thanks for registering with us. Our team will contact you shortly ${
              searchKey && "and will inform you once your website is created"
            }.</p>
            <p>Cheers,<br/>The WONO Team</p>
          `,
          });
          console.log("✅ Registration email sent to", payload.email);
        } catch (err) {
          console.error("❌ Failed to send email:", err.message);
        }
      }

      const message = searchKey ? websiteResult : "Form submitted successfully";
      // STEP 4: respond
      console.log("sheetResult", sheetResult);
      return res.status(201).json({
        message: message,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Inner transaction error:", error);
      return res
        .status(500)
        .json({ error: "Transaction failed", detail: error.message });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.errors[0], // only the first message
      });
    }
    if (err?.status === 502) {
      return res
        .status(502)
        .json({ error: "Upstream write failed", detail: err.detail });
    }
    console.error("❌ Outer error:", err);
    return res
      .status(500)
      .json({ error: "Unexpected server error", detail: err.message });
  }
};
