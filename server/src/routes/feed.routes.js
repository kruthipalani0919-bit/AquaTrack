import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createFeedController,
    getFeedsController,
    getFeedByIdController,
    updateFeedController,
    deleteFeedController,
    getRecentFeedsController,
    getTodayFeedSummaryController
} from "../controllers/feed.controller.js";

import {
    createFeedSchema,
    updateFeedSchema
} from "../validations/feed.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createFeedSchema),
    createFeedController
);

router.get(
    "/",
    auth,
    getFeedsController
);

router.get(
    "/recent",
    auth,
    getRecentFeedsController
);

router.get(
    "/today",
    auth,
    getTodayFeedSummaryController
);

router.get(
    "/:id",
    auth,
    getFeedByIdController
);

router.put(
    "/:id",
    auth,
    validate(updateFeedSchema),
    updateFeedController
);

router.delete(
    "/:id",
    auth,
    deleteFeedController
);

export default router;