import * as yup from "yup";
import Consultation from "../models/Consultation.js";

const consultationSchema = yup.object({
    supportRequired: yup.string().required("Support required is required"),
    fullName: yup.string().required("Full name is required"),
    currentCountry: yup.string().required("Current country is required"),
    consultationCountry: yup.string().required("Consultation country is required"),
    email: yup
        .string()
        .trim()
        .email("Please provide a valid email")
        .required("Email is required"),
    contactCode: yup.string().required("Contact code is required"),
    contactNumber: yup.string().required("Contact number is required"),
    comments: yup.string().trim().default(""),
});

export const createConsultation = async (req, res, next) => {
    try {
        const payload = await consultationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const consultation = await Consultation.create(payload);

        return res.status(201).json({
            message: "Consultation request submitted successfully",
            data: consultation,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.errors[0] });
        }

        return next(error);
    }
};