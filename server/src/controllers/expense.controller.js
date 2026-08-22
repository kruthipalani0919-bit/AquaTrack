import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseCategories,
    getExpenseSummary
} from "../services/expense.service.js";

export const createExpenseController = async (req, res) => {

    try {

        const expense = await createExpense(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Expense created successfully",

            data: expense

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getExpensesController = async (req, res) => {

    try {

        const expenses = await getExpenses(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Expenses fetched successfully",

            data: expenses

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getExpenseByIdController = async (req, res) => {

    try {

        const expense = await getExpenseById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Expense fetched successfully",

            data: expense

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const updateExpenseController = async (req, res) => {

    try {

        const expense = await updateExpense(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Expense updated successfully",

            data: expense

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const deleteExpenseController = async (req, res) => {

    try {

        await deleteExpense(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Expense deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getExpenseCategoriesController = async (req, res) => {

    try {

        const categories = await getExpenseCategories();

        return res.status(200).json({

            success: true,

            message: "Expense categories fetched successfully",

            data: categories

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getExpenseSummaryController = async (req, res) => {

    try {

        const summary = await getExpenseSummary(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Expense summary fetched successfully",

            data: summary

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};