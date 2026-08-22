import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createHarvestController,
    getHarvestsController,
    getHarvestByIdController,
    deleteHarvestController,
    getHarvestSummaryController
} from "../controllers/harvest.controller.js";

import {
    createHarvestSchema,
    updateHarvestSchema
} from "../validations/harvest.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createHarvestSchema),
    createHarvestController
);

router.get(
    "/",
    auth,
    getHarvestsController
);

router.get(
    "/summary",
    auth,
    getHarvestSummaryController
);

router.get(
    "/:id",
    auth,
    getHarvestByIdController
);

router.delete(
    "/:id",
    auth,
    deleteHarvestController
);

export default router;