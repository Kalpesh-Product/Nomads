import mongoose from "mongoose";

const MESSAGE_CHARACTER_LIMIT = 1000;

const becomeContributorSchema = new mongoose.Schema(
    {
        nomadUser: { type: mongoose.Schema.Types.ObjectId, ref: "NomadUser", default: null },
        verificationId: { type: String, trim: true, unique: true, sparse: true, index: true },
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
        partnerStatuses: {
            isVisaPartner: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
            isCompanySetupPartner: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
            isActivationSupportPartner: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
            isConsultationSupportPartner: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
            isWorkationPartner: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        },
    },
    { timestamps: true },
);

export default mongoose.model("BecomeContributor", becomeContributorSchema);
