import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import {
    createStockingController,
    getStockingsController,
    getStockingByIdController,
    updateStockingController,
    deleteStockingController,
    allocateStockToSiteController,
    getSiteStockAllocationsController
} from "../controllers/stocking.controller.js";

import validate from "../middleware/validate.middleware.js";

import {
    createStockingSchema,
    updateStockingSchema,
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
 * Get Stock Allocations for a Site
 */
router.get(
    "/site/:siteId",
    auth,
    getSiteStockAllocationsController
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
 * Update Stock
 */
router.put(
    "/:id",
    auth,
    validate(updateStockingSchema),
    updateStockingController
);


/*
 * Delete Stock
 */
router.delete(
    "/:id",
    auth,
    deleteStockingController
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


export default router;
