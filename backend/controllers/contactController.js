import axios from "axios";
import Contact from "../models/Contact.js";

export const contactInfo = async (req, res, next) => {
  try {
    const { name, email, mobile, partnership, message } = req.body;

    if (!name || !email || !mobile || !partnership || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const emailExists = await Contact.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const contact = new Contact({
      name,
      email,
      mobile,
      partnership,
      message,
    });

    const savedContact = await contact.save();
    const objectContact = savedContact.toObject();
    axios
      .post(
        process.env.GOOGLE_SHEET_LINK,
        {
          ...objectContact,
          mobile: `'${objectContact.mobile}`,
          type: "contact",
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
          return res.status(200).json({ message: "Contact info saved." });
        }
      })
      .catch((error) => {
        console.error("Google Sheets error:", error);
        return res.status(500).json({
          error: "Contact info saved, but failed to sync with Google Sheets.",
        });
      });
  } catch (error) {
    next(error);
  }
};
