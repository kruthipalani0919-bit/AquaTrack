import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank,
    getActiveCrop
} from "../utils/farm.helpers.js";

import {
    expenseCategories
} from "../validations/expense.validation.js";


/*
 * Create Expense
 *
 * Categories and payment modes are validated
 * by expense.validation.js.
 */
export const createExpense = async (
    userId,
    expenseData
) => {

    const farm =
        await getUserFarm(userId);


    const tank =
        await getUserTank(

            farm.id,

            expenseData.tankId

        );


    const crop =
        await getActiveCrop(

            tank.id

        );


    const expense =
        await prisma.expense.create({

            data: {

                cropId:
                    crop.id,

                category:
                    expenseData.category,

                description:
                    expenseData.description,

                amount:
                    expenseData.amount,

                paymentMode:
                    expenseData.paymentMode,

                receipt:
                    null,

                date:
                    new Date(
                        expenseData.date
                    ),

                notes:
                    expenseData.notes ??
                    null

            }

        });


    return expense;

};


/*
 * Get all Expenses
 */
export const getExpenses = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const expenses =
        await prisma.expense.findMany({

            where: {

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                }

            },

            include: {

                crop: {

                    include: {

                        tank: true

                    }

                }

            },

            orderBy: {

                date: "desc"

            }

        });


    return expenses;

};


/*
 * Get Expense by ID
 */
export const getExpenseById = async (
    userId,
    expenseId
) => {

    const farm =
        await getUserFarm(userId);


    const expense =
        await prisma.expense.findFirst({

            where: {

                id:
                    expenseId,

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                }

            },

            include: {

                crop: {

                    include: {

                        tank: true

                    }

                }

            }

        });


    if (!expense) {

        throw new Error(
            "Expense not found."
        );

    }


    return expense;

};


/*
 * Update Expense
 */
export const updateExpense = async (
    userId,
    expenseId,
    expenseData
) => {

    /*
     * Verify that the Expense belongs
     * to the logged-in user's Farm.
     */
    await getExpenseById(

        userId,

        expenseId

    );


    const updateData = {

        ...expenseData

    };


    /*
     * Convert date string to Date.
     */
    if (updateData.date) {

        updateData.date =
            new Date(
                updateData.date
            );

    }


    /*
     * tankId is only used to locate
     * the Crop during creation.
     *
     * It should not be updated directly.
     */
    delete updateData.tankId;


    const expense =
        await prisma.expense.update({

            where: {

                id:
                    expenseId

            },

            data:
                updateData

        });


    return expense;

};


/*
 * Delete Expense
 */
export const deleteExpense = async (
    userId,
    expenseId
) => {

    await getExpenseById(

        userId,

        expenseId

    );


    await prisma.expense.delete({

        where: {

            id:
                expenseId

        }

    });


    return {

        message:
            "Expense deleted successfully."

    };

};


/*
 * Get Expense Categories
 *
 * Uses the same category list from
 * expense.validation.js.
 *
 * Current categories:
 *
 * Pond Lease
 * Pond Preparation
 * Seed Cost
 * Electricity
 * Generator & Diesel
 * Labour
 * Maintenance
 * Salaries
 */
export const getExpenseCategories = async () => {

    return expenseCategories;

};


/*
 * Get Expense Summary
 */
export const getExpenseSummary = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const expenses =
        await prisma.expense.findMany({

            where: {

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                }

            }

        });


    const totalExpenses =
        expenses.reduce(

            (sum, item) =>
                sum + item.amount,

            0

        );


    const categoryWise = {};


    expenses.forEach(
        (expense) => {

            categoryWise[
                expense.category
            ] =

                (
                    categoryWise[
                        expense.category
                    ] || 0
                ) +

                expense.amount;

        }
    );


    return {

        totalExpenses,

        totalEntries:
            expenses.length,

        categoryWise

    };

};