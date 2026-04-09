import * as yup from "yup";
import VisaSupportRequest from "../models/VisaSupportRequest.js";

const visaSupportSchema = yup.object({
    visaType: yup.string().trim().required("Visa type is required"),
    fullName: yup.string().trim().required("Full name is required"),
    nationality: yup.string().trim().required("Nationality is required"),
    travellingCountry: yup.string().trim().required("Travelling country is required"),
    email: yup
        .string()
        .trim()
        .email("Please provide a valid email")
        .required("Email is required"),
    contactCode: yup.string().trim().required("Contact code is required"),
    contactNumber: yup.string().trim().required("Contact number is required"),
    comments: yup.string().trim().default(""),
});

export const createVisaSupportRequest = async (req, res, next) => {
    try {
        const payload = await visaSupportSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const visaSupportRequest = await VisaSupportRequest.create(payload);

        return res.status(201).json({
            message: "Visa support request submitted successfully",
            data: visaSupportRequest,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.errors[0] });
        }

        return next(error);
    }
};