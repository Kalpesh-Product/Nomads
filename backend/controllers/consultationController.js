import axios from "axios";
import Consultation from "../models/Consultation.js";

export const submitConsultation = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile, reason } = req.body;

    if (!firstName || !lastName || !email || !mobile || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const emailExists = await Consultation.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const consultation = new Consultation({
      firstName,
      lastName,
      email,
      mobile,
      reason,
    });

    const savedConsultation = await consultation.save();
    const objectConsultation = savedConsultation.toObject();
    axios
      .post(
        process.env.GOOGLE_SHEET_LINK,
        {
          ...objectConsultation,
          mobile: `'${objectConsultation.mobile}`,
          type: "consultation",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => response.data)
      .then((data) => {
        if (data?.status === "success") {
          return res
            .status(200)
            .json({ message: "Consultation request submitted successfully." });
        }
      })
      .catch((error) => {
        console.error("Google Sheets error:", error);
        return res.status(500).json({
          error:
            "Consultatoin booking saved, but failed to sync with Google Sheets.",
        });
      });
  } catch (error) {
    next(error);
  }
};
