import NomadUser from "../models/NomadUser.js";
import { getRequestedContributorRoles } from "../utils/contributorRoles.js";
import { verifyJwt } from "./verifyJwt.js";

export const authenticateContributorSubmission = (req, res, next) => {
  if (getRequestedContributorRoles(req.body?.contributionType).length) {
    return verifyJwt(req, res, next);
  }
  return next();
};

// Read current approval from the database, since a previously issued JWT may be stale.
export const requireContributorRole = (role) => async (req, res, next) => {
  try {
    const user = await NomadUser.findById(req.userData?._id).select(role).lean();
    if (user?.[role] !== true) {
      return res.status(403).json({ message: "Your contributor access is inactive or awaiting approval." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
