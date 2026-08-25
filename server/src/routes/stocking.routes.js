import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import {
    createStockingController,
    getStockingsController,
    getStockingByIdController,
    allocateStockToSiteController,
    getSiteStockAllocationsController,
    updateStockingController,
    deleteStockingController,
    updateSiteStockAllocationController,
    deleteSiteStockAllocationController
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
 * Update Farm Stock
 */
router.put(
    "/:id",
    auth,
    updateStockingController
);


/*
 * Delete Farm Stock
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


/*
 * Update Site Stock Allocation
 */
router.put(
    "/allocation/:id",
    auth,
    updateSiteStockAllocationController
);


/*
 * Delete Site Stock Allocation
 */
router.delete(
    "/allocation/:id",
    auth,
    deleteSiteStockAllocationController
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