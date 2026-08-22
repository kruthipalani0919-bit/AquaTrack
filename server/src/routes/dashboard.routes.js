import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import { getDashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get(
    "/",
    auth,
    getDashboardController
);

export default router;