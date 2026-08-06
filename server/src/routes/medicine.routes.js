import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createMedicineController,
    getMedicinesController,
    getMedicineByIdController,
    updateMedicineController,
    deleteMedicineController,
    getMedicineSummaryController
} from "../controllers/medicine.controller.js";

import {
    createMedicineSchema,
    updateMedicineSchema
} from "../validations/medicine.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createMedicineSchema),
    createMedicineController
);

router.get(
    "/",
    auth,
    getMedicinesController
);

router.get(
    "/summary",
    auth,
    getMedicineSummaryController
);

router.get(
    "/:id",
    auth,
    getMedicineByIdController
);

router.put(
    "/:id",
    auth,
    validate(updateMedicineSchema),
    updateMedicineController
);

router.delete(
    "/:id",
    auth,
    deleteMedicineController
);

export default router;