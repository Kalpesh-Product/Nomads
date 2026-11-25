import ConnectWithUs from "../../models/ConnectWithUs.js";
import JobApplication from "../../models/JobApplication.js";
import ContentRemoval from "../../models/ContentRemoval.js";

/*
 * Simple status updates for the three Master Panel lead tabs.
 *
 * TODO(next) — do these before exposing these routes beyond localhost:
 * 1. Auth: mount verifyAdminApiKey here (same pattern as
 *    placeRoutes/eventRoutes `PATCH /contributions/:id/status`), or proxy
 *    through the Master Panel server so role permissions apply. Today anyone
 *    who can reach /api/forms can change a candidate's or request's status.
 * 2. Audit: append { from, to, changedBy, changedAt, note } to a statusHistory
 *    array on each change — `updatedAt` is not enough for HR/moderation
 *    decisions. Require a note when setting "Rejected".
 * 3. Transitions: enforce allowed transitions server-side (e.g. no silent
 *    Rejected -> Pending), and decide whether status should sync back to
 *    Google Sheets. Current decision: Sheets stays capture-only.
 */

const makeStatusUpdater = (Model, allowedStatuses) => async (req, res, next) => {
  try {
    const { status } = req.body || {};

    // Enum check is data integrity, not security — see TODO 1 above.
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Expected one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const updated = await Model.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.status(200).json({ data: updated });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid record id" });
    }
    return next(error);
  }
};

export const updateConnectWithUsStatus = makeStatusUpdater(ConnectWithUs, [
  "Pending",
  "Contacted",
  "Closed",
]);

export const updateJobApplicationStatus = makeStatusUpdater(JobApplication, [
  "Pending",
  "Reviewed",
  "Shortlisted",
  "Rejected",
]);

export const updateContentRemovalStatus = makeStatusUpdater(ContentRemoval, [
  "Pending",
  "In Review",
  "Resolved",
  "Rejected",
]);
