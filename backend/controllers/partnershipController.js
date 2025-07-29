import Partnership from "../models/PartnershipLead.js";
import axios from "axios";
import { config } from "dotenv";
config();
export const newPartnershipLead = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      country,
      mobile,
      yourProfile,
      message,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !country ||
      !mobile ||
      !yourProfile
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const newPartnerShipLead = new Partnership({
      firstName,
      lastName,
      email,
      country,
      mobile,
      yourProfile,
      message,
    });
    const savedpartnership = await newPartnerShipLead.save();
    const objectPartnerShip = savedpartnership.toObject();
    axios
      .post(
        process.env.GOOGLE_SHEET_LINK,
        {
          ...objectPartnerShip,
          mobile: `'${objectPartnerShip.mobile}`,
          type: "partnershipLeads",
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
          return res.status(200).json({ message: "success" });
        }
      })
      .catch((error) => {
        throw new Error(
          "Lead saved, but failed to sync with Google Sheets" + error.message
        );
      });
  } catch (error) {
    next(error);
  }
};
