import Company from "../models/Company";
import yup from "yup";

const addNewCompany = async (req, res, next) => {
  try {
    const {
      businessId,
      companyName,
      registeredEntityName,
      website,
      service,
      logo,
      images,
      address,
      country,
      state,
      city,
      about,
      totalSeats,
      latitude,
      longitude,
      googleMapLink,
    } = req.body;

    const schema = yup.object({
      companyName: yup.string().required("Please provide your company name"),
      registeredEntityName: yup
        .string()
        .required("Please provide a Registered Entity Name"),
      website: yup.string().optional().url("Please provide a valid url"),
      service: yup.string().required("Please provide your business service"),
      address: yup.string().required("Please provide your address"),
      country: yup.string().required("Please provide your country"),
      state: yup.string().required("Please provide your state"),
      city: yup.string().required("Please provide your city"),
      totalSeats: yup
        .number()
        .min(1, "You must have minimum 1 seat to be registered"),
      latitude: yup.number().required("Please provide your latitude"),
      longitude: yup.number().required("Please provide your longitude"),
      about: yup
        .string()
        .min(1)
        .required("Please provide a brief descriptio about your company"),
      googleMapLink: yup
        .string()
        .required("Please provide you google map location")
        .url("Please provide a valid google map location url"),
    });

    await schema.validate(req.body, { abortEarly: false });

    const existingCompany = await Company.findOne({ businessId });
    if (existingCompany) {
      return res.status(409).json({
        message: "A company with this businessId already exists.",
      });
    }

    // Create and save new company
    const newCompany = new Company({
      businessId,
      companyName,
      registeredEntityName,
      website,
      service,
      logo,
      images,
      address,
      country,
      state,
      city,
      about,
      totalSeats,
      latitude,
      longitude,
      googleMapLink,
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: "Company added successfully.",
      data: savedCompany,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        message: error.errors,
        errors: error.errors,
      });
    }
    next(error);
  }
};

export default {
  addNewCompany,
};
