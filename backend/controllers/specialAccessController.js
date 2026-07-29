import SpecialAccessUser from "../models/SpecialAccessUser.js";

// Emails in this list can see all countries/states and non-public listings,
// managed dynamically from the Wono Master Panel's User Access module.
export const getSpecialAccessEmails = async (req, res, next) => {
  try {
    const users = await SpecialAccessUser.find().select("email").lean().exec();
    return res.status(200).json(users.map((u) => u.email));
  } catch (error) {
    next(error);
  }
};

export const addSpecialAccessEmail = async (req, res, next) => {
  try {
    const email = req.body?.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await SpecialAccessUser.findOne({ email }).lean().exec();
    if (existing) {
      return res.status(409).json({ message: "This email already has special access" });
    }

    const created = await SpecialAccessUser.create({ email });
    return res.status(201).json({
      message: "Special access granted",
      email: created.email,
    });
  } catch (error) {
    next(error);
  }
};

export const removeSpecialAccessEmail = async (req, res, next) => {
  try {
    const email = req.params?.email?.toLowerCase().trim();
    const deleted = await SpecialAccessUser.findOneAndDelete({ email }).exec();

    if (!deleted) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({ message: "Special access removed", email });
  } catch (error) {
    next(error);
  }
};
