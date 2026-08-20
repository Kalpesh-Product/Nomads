import { Router } from "express";

import {
  listNomadUsersForAdmin,
  getDestinationViewsForAdmin,
  getListingViewsForAdmin,
  getPopularDestinationsForAdmin,
  getSessionLogsForAdmin,
  getUserActivityForExport,
} from "../controllers/adminNomadUserControllers.js";

const router = Router();

router.get("/", listNomadUsersForAdmin);
router.get("/popular-destinations", getPopularDestinationsForAdmin);
router.get("/:userId/destination-views", getDestinationViewsForAdmin);
router.get("/:userId/listing-views", getListingViewsForAdmin);
router.get("/:userId/sessions", getSessionLogsForAdmin);
router.get("/:userId/export-data", getUserActivityForExport);

export default router;
