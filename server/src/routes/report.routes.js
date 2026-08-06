import { Router } from "express";

import auth from "../middleware/auth.middleware.js";

import {

    getReportTanksController,

    getActiveTankReportController,

    getCompletedCropsController,

    getCompletedCropReportController

} from "../controllers/report.controller.js";

const router = Router();

/* ---------------------------------------------
   Get All Tanks for Reports
----------------------------------------------*/

router.get(

    "/tanks",

    auth,

    getReportTanksController

);

/* ---------------------------------------------
   Get Active Tank Report
----------------------------------------------*/

router.get(

    "/tank/:tankId/active",

    auth,

    getActiveTankReportController

);

/* ---------------------------------------------
   Get Completed Crops of a Tank
----------------------------------------------*/

router.get(

    "/tank/:tankId/completed",

    auth,

    getCompletedCropsController

);

/* ---------------------------------------------
   Get Completed Crop Report
----------------------------------------------*/

router.get(

    "/crop/:cropId",

    auth,

    getCompletedCropReportController

);

export default router;