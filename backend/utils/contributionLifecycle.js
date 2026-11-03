// Lifecycle metadata is controlled by contributor actions and moderation.
export const contributionLifecycleFields = {
  rejectionReason: { type: String, trim: true, default: "", maxlength: 500 },
  deletionReason: { type: String, trim: true, default: "", maxlength: 500 },
  deletedAt: { type: Date, default: null },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: "", trim: true },
  reviewedById: { type: String, default: "", trim: true },
  lastEditedAt: { type: Date, default: null },
  moderationHistory: [{
    _id: false,
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true },
    date: { type: Date, required: true },
    reason: { type: String, default: "", maxlength: 500 },
    actor: { type: String, default: "Master Panel" },
    actorId: { type: String, default: "", trim: true },
  }],
};

export const stripLifecycleFields = (payload) => {
  for (const field of Object.keys(contributionLifecycleFields)) delete payload[field];
};

export const resubmissionFields = (isDraft) => {
  const editedAt = new Date();
  return {
    lastEditedAt: editedAt,
    reviewedAt: null,
    reviewedBy: "",
    reviewedById: "",
    rejectionReason: "",
    ...(!isDraft ? { $push: { moderationHistory: {
      status: "pending", date: editedAt, actor: "Contributor",
    } } } : {}),
  };
};

export const applyContributionStatusFilter = (query, status) => {
  if (!status || status === "all") return;
  if (status === "deleted") query.deletedAt = { $ne: null };
  else {
    query.status = status;
    query.deletedAt = null;
  }
};

export const serializeContribution = (item) => item.deletedAt ? {
  ...item.toObject(), statusBeforeDeletion: item.status, status: "deleted",
} : item;

export const createDeleteContribution = (Model, label) => async (req, res, next) => {
  try {
    const user = req.userData?._id;
    if (!user) return res.status(401).json({ message: "Authentication required" });
    const { deletionReason, agreedToDelete } = req.body || {};
    if (agreedToDelete !== true) {
      return res.status(400).json({ message: `Please agree before deleting this ${label.toLowerCase()}.` });
    }
    if (typeof deletionReason !== "string" || !deletionReason.trim()) {
      return res.status(400).json({ message: "Reason for deleting is required." });
    }
    const reason = deletionReason.trim();
    if (reason.length > 500) {
      return res.status(400).json({ message: "Deletion reason must be 500 characters or fewer." });
    }
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, contributor: user, deletedAt: null },
      { $set: { deletedAt: new Date(), deletionReason: reason, isActive: false } },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: `${label} contribution not found` });
    return res.status(200).json({ message: `${label} deleted successfully` });
  } catch (error) { next(error); }
};

export const createModerateContribution = (Model, label, responseKey) => async (req, res, next) => {
  try {
    const status = String(req.body.status || "").toLowerCase();
    const reason = String(req.body.rejectionReason || "").trim();
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: `Invalid ${label.toLowerCase()} status` });
    }
    if (status === "rejected" && !reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    if (status === "rejected" && reason.length > 500) {
      return res.status(400).json({ message: "Rejection reason must be 500 characters or fewer." });
    }
    // Identity is supplied by the staff session through the admin API-key-protected route.
    const reviewedBy = typeof req.body.reviewedBy === "string" ? req.body.reviewedBy.trim() : "";
    const reviewedById = typeof req.body.reviewedById === "string" ? req.body.reviewedById.trim() : "";
    const reviewedAt = new Date();
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, contributor: { $exists: true, $ne: null }, deletedAt: null, isDraft: { $ne: true } },
      {
        status, rejectionReason: status === "rejected" ? reason : "",
        isActive: status === "approved", reviewedAt, reviewedBy, reviewedById,
        $push: { moderationHistory: {
          status, date: reviewedAt, reason: status === "rejected" ? reason : "",
          actor: reviewedBy || "Master Panel", actorId: reviewedById,
        } },
      },
      { new: true, runValidators: true },
    ).populate("contributor", "firstName lastName fullName name email");
    if (!item) return res.status(404).json({ message: `${label} contribution not found` });
    return res.status(200).json({ message: `${label} ${status} successfully`, [responseKey]: item });
  } catch (error) { next(error); }
};
