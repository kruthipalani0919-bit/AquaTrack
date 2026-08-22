import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createCropController,
    getCropsController,
    getActiveCropsController,
    getCropByIdController,
    updateCropController,
    completeCropController,
    deleteCropController
} from "../controllers/crop.controller.js";
import { createCropSchema, updateCropSchema } from "../validations/crop.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createCropSchema),
    createCropController
);

router.get(
    "/",
    auth,
    getCropsController
);

router.get(
    "/active",
    auth,
    getActiveCropsController
);

router.get(
    "/:id",
    auth,
    getCropByIdController
);

router.put(
    "/:id",
    auth,
    validate(updateCropSchema),
    updateCropController
);

router.patch(
    "/:id/complete",
    auth,
    completeCropController
);

router.delete(
    "/:id",
    auth,
    deleteCropController
);

export default router;