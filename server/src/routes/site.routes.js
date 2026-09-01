import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import verifyPassword from "../middleware/verifyPassword.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createSiteSchema,
    updateSiteSchema
} from "../validations/site.validation.js";

import {
    createSiteController,
    getSitesController,
    getSiteByIdController,
    updateSiteController,
    deleteSiteController
} from "../controllers/site.controller.js";

const router = Router();


/*
 * Create Site
 */
router.post(
    "/",
    auth,
    validate(createSiteSchema),
    createSiteController
);


/*
 * Get All Sites
 */
router.get(
    "/",
    auth,
    getSitesController
);


/*
 * Get Site By ID
 */
router.get(
    "/:siteId",
    auth,
    getSiteByIdController
);


/*
 * Update Site
 */
router.put(
    "/:siteId",
    auth,
    validate(updateSiteSchema),
    updateSiteController
);


/*
 * Delete Site
 */
router.delete(
    "/:siteId",
    auth,
    verifyPassword,
    deleteSiteController
);


export default router;