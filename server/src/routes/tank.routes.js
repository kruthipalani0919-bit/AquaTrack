import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import verifyPassword from "../middleware/verifyPassword.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createTankController,
    getTanksController,
    getTankByIdController,
    updateTankController,
    deleteTankController
} from "../controllers/tank.controller.js";

import {
    createTankSchema,
    updateTankSchema
} from "../validations/tank.validation.js";

const router = Router();


/*
 * Create Tank
 */
router.post(
    "/",
    auth,
    validate(createTankSchema),
    createTankController
);


/*
 * Get All Tanks
 */
router.get(
    "/",
    auth,
    getTanksController
);


/*
 * Get Tank By ID
 */
router.get(
    "/:id",
    auth,
    getTankByIdController
);


/*
 * Update Tank
 */
router.put(
    "/:id",
    auth,
    validate(updateTankSchema),
    updateTankController
);


/*
 * Delete Tank
 */
router.delete(
    "/:id",
    auth,
    verifyPassword,
    deleteTankController
);


export default router;