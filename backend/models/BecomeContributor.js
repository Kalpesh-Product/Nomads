import mongoose from "mongoose";

const MESSAGE_CHARACTER_LIMIT = 1000;

const becomeContributorSchema = new mongoose.Schema(
    {
        contributionType: { type: String, trim: true, required: true },
        fullName: { type: String, trim: true, required: true },
        currentCountry: { type: String, trim: true, default: "" },
        linkedinProfile: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, required: true },
        contactCode: { type: String, trim: true, required: true },
        contactNumber: { type: String, trim: true, required: true },
        message: {
            type: String,
            trim: true,
            default: "",
            maxlength: MESSAGE_CHARACTER_LIMIT,
        },
    },
    { timestamps: true },
);

export default mongoose.model("BecomeContributor", becomeContributorSchema);
