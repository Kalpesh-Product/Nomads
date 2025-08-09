import * as yup from "yup";

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

function toISODateOnly(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const addNewEnquiry = async (req, res, next) => {
  try {
    if (!process.env.APPS_SCRIPT_URL) {
      throw new Error("APPS_SCRIPT_URL is not configured");
    }

    const body = req.body;

    if (body?.sheetName === "All_Enquiry") {
      const validatedData = await enquirySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const payload = {
        companyName: validatedData.companyName,
        verticalType: validatedData.companyType,
        country: validatedData.country || "",
        state: validatedData.state || "",
        fullName: validatedData.fullName,
        noOfPeople: validatedData.personelCount,
        mobileNumber: validatedData.phone,
        email: validatedData.email,
        startDate: toISODateOnly(validatedData.startDate),
        endDate: toISODateOnly(validatedData.endDate),
        sheetName: validatedData.sheetName,
      };

      const response = await fetch(process.env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          result.message || "Failed to save data to Google Sheets"
        );
      }

      res.status(201).json({
        status: "success",
        message: "Enquiry added successfully",
        data: payload,
      });
    } else {
      const validatedData = await pocSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const payload = {
        pocName: validatedData.pocName,
        pocCompany: validatedData.pocCompany,
        pocDesignation: validatedData.pocDesignation,
        fullName: validatedData.fullName,
        mobile: validatedData.mobile,
        email: validatedData.email,
        sheetName: validatedData.sheetName,
      };

      const response = await fetch(process.env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          result.message || "Failed to save POC data to Google Sheets"
        );
      }

      res.status(201).json({
        status: "success",
        message: "POC added successfully",
        data: payload,
      });
    }
  } catch (err) {
    next(err);
  }
};
