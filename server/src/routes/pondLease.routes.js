import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import verifyPassword from "../middleware/verifyPassword.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createPondLeaseController,
    getPondLeasesController,
    getPondLeaseByIdController,
    getLeaseCropAllocationsController,
    updatePondLeaseController,
    deletePondLeaseController
} from "../controllers/pondLease.controller.js";

import {
    createPondLeaseSchema,
    updatePondLeaseSchema
} from "../validations/pondLease.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createPondLeaseSchema),
    createPondLeaseController
);

router.get(
    "/",
    auth,
    getPondLeasesController
);

router.get(
    "/:id",
    auth,
    getPondLeaseByIdController
);

router.get(
    "/:id/crop-allocations",
    auth,
    getLeaseCropAllocationsController
);

router.put(
    "/:id",
    auth,
    validate(updatePondLeaseSchema),
    updatePondLeaseController
);

router.delete(
    "/:id",
    auth,
    verifyPassword,
    deletePondLeaseController
);

export default router;
