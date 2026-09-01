import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import verifyPassword from "../middleware/verifyPassword.middleware.js";

import validate from "../middleware/validate.middleware.js";

import { createFarmSchema, updateFarmSchema } from "../validations/farm.validation.js";

import {
    createFarmController,
    getFarmController,
    updateFarmController,
    deleteFarmController
} from "../controllers/farm.controller.js";

const router = Router();

router.post(

    "/",

    auth,

    validate(createFarmSchema),

    createFarmController

);

router.get(

    "/",

    auth,

    getFarmController

);

router.put(

    "/:id",

    auth,

    validate(updateFarmSchema),

    updateFarmController

);

router.delete(

    "/:id",

    auth,

    verifyPassword,

    deleteFarmController

);

export default router;