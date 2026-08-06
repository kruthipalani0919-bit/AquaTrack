import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
    createTankController,
    getTanksController,
    getTankByIdController,
    updateTankController,
    deleteTankController
} from "../controllers/tank.controller.js";

import { createTankSchema, updateTankSchema } from "../validations/tank.validation.js";

const router = Router();

router.post(

    "/",

    auth,

    validate(createTankSchema),

    createTankController

);

router.get(

    "/",

    auth,

    getTanksController

);

router.get(

    "/:id",

    auth,

    getTankByIdController

);

router.put(

    "/:id",

    auth,

    validate(updateTankSchema),

    updateTankController

);

router.delete(

    "/:id",

    auth,

    deleteTankController

);

export default router;