import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import verifyPassword from "../middleware/verifyPassword.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createExpenseController,
    getExpensesController,
    getExpenseByIdController,
    updateExpenseController,
    deleteExpenseController,
    getExpenseCategoriesController,
    getExpenseSummaryController
} from "../controllers/expense.controller.js";

import {
    createExpenseSchema,
    updateExpenseSchema
} from "../validations/expense.validation.js";

const router = Router();

router.post(
    "/",
    auth,
    validate(createExpenseSchema),
    createExpenseController
);

router.get(
    "/",
    auth,
    getExpensesController
);

router.get(
    "/categories",
    auth,
    getExpenseCategoriesController
);

router.get(
    "/summary",
    auth,
    getExpenseSummaryController
);

router.get(
    "/:id",
    auth,
    getExpenseByIdController
);

router.put(
    "/:id",
    auth,
    validate(updateExpenseSchema),
    updateExpenseController
);

router.delete(
    "/:id",
    auth,
    verifyPassword,
    deleteExpenseController
);

export default router;