import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import {
    createStockingController,
    getStockingsController,
    getStockingByIdController,
    allocateStockToSiteController,
    getSiteStockAllocationsController
} from "../controllers/stocking.controller.js";

import validate from "../middleware/validate.middleware.js";

import {
    createStockingSchema,
    allocateStockSchema
} from "../validations/stocking.validation.js";

const router = Router();


/*
 * Create Farm Stock
 */
router.post(
    "/",
    auth,
    validate(createStockingSchema),
    createStockingController
);


/*
 * Get all Farm Stock
 */
router.get(
    "/",
    auth,
    getStockingsController
);


/*
 * Get Stock by ID
 */
router.get(
    "/:id",
    auth,
    getStockingByIdController
);


/*
 * Allocate Stock to Site
 */
router.post(
    "/:id/allocate",
    auth,
    validate(allocateStockSchema),
    allocateStockToSiteController
);


/*
 * Get Stock Allocations for a Site
 */
router.get(
    "/site/:siteId",
    auth,
    getSiteStockAllocationsController
);


export default router;