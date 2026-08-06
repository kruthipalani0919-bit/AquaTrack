import { Router } from "express";

import { healthCheck } from "../controllers/health.controller.js";
import authRoutes from "./auth.routes.js";
import farmRoutes from "./farm.routes.js";
import tankRoutes from "./tank.routes.js";
import cropRoutes from "./crop.routes.js";
import feedRoutes from "./feed.routes.js";
import expenseRoutes from "./expense.routes.js";
import medicineRoutes from "./medicine.routes.js";
import harvestRoutes from "./harvest.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reportRoutes from "./report.routes.js";
const router = Router();

router.get("/health", healthCheck);

router.use("/auth", authRoutes);

router.use("/farms", farmRoutes);

router.use("/tanks", tankRoutes);

router.use("/crops", cropRoutes);

router.use("/feed", feedRoutes);

router.use("/expenses", expenseRoutes);

router.use("/medicines", medicineRoutes);

router.use("/harvests", harvestRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/reports", reportRoutes);
export default router;