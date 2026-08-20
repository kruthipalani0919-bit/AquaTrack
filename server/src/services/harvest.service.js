import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank,
    getActiveCrop
} from "../utils/farm.helpers.js";


/*
 * Create Harvest
 */
export const createHarvest = async (
    userId,
    harvestData
) => {

    const farm =
        await getUserFarm(userId);


    const tank =
        await getUserTank(
            farm.id,
            harvestData.tankId
        );


    const crop =
        await getActiveCrop(
            tank.id
        );


    /*
     * Calculate Average Body Weight (ABW)
     *
     * Formula:
     * ABW = 1000 / Shrimp Count
     *
     * Example:
     * 60 count = 16.67 grams
     */
    const averageWeight =
        1000 / harvestData.shrimpCount;


    /*
     * Revenue
     */
    const revenue =
        harvestData.production *
        harvestData.sellingPrice;


    /*
     * Feed Cost
     */
    const feedEntries =
        await prisma.feedEntry.findMany({

            where: {
                cropId: crop.id
            }

        });


    const feedCost =
        feedEntries.reduce(
            (sum, item) =>
                sum + item.totalCost,
            0
        );


    /*
     * Expense Cost
     */
    const expenses =
        await prisma.expense.findMany({

            where: {
                cropId: crop.id
            }

        });


    const expenseCost =
        expenses.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );


    /*
     * Medicine Cost
     */
    const medicines =
        await prisma.medicine.findMany({

            where: {
                tankId: tank.id
            }

        });


    const medicineCost =
        medicines.reduce(
            (sum, item) =>
                sum + item.cost,
            0
        );


    /*
     * Total Expense
     *
     * Transportation cost is no longer used.
     */
    const totalExpense =
        feedCost +
        expenseCost +
        medicineCost +
        harvestData.harvestExpense;


    /*
     * Profit
     */
    const profit =
        revenue -
        totalExpense;


    /*
     * Create Harvest
     */
    const harvest =
        await prisma.harvest.create({

            data: {

                cropId:
                    crop.id,

                harvestDate:
                    new Date(
                        harvestData.harvestDate
                    ),

                production:
                    harvestData.production,


                /*
                 * Store user-entered shrimp count
                 */
                shrimpCount:
                    harvestData.shrimpCount,


                /*
                 * Store automatically calculated ABW
                 */
                averageWeight,


                survivalRate:
                    harvestData.survivalRate,

                sellingPrice:
                    harvestData.sellingPrice,

                buyerName:
                    harvestData.buyerName,


                /*
                 * No longer collected from frontend
                 */
                transportationCost:
                    null,


                harvestExpense:
                    harvestData.harvestExpense,

                revenue,

                profit

            }

        });


    /*
     * Mark Crop as Completed
     */
    await prisma.crop.update({

        where: {

            id:
                crop.id

        },

        data: {

            status:
                "COMPLETED"

        }

    });


    return harvest;

};


/*
 * Get all Harvests
 */
export const getHarvests = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    return await prisma.harvest.findMany({

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

                    tank:
                        true

                }

            }

        },

        orderBy: {

            harvestDate:
                "desc"

        }

    });

};


/*
 * Get Harvest by ID
 */
export const getHarvestById = async (
    userId,
    harvestId
) => {

    const farm =
        await getUserFarm(userId);


    const harvest =
        await prisma.harvest.findFirst({

            where: {

                id:
                    harvestId,

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

                        tank:
                            true

                    }

                }

            }

        });


    if (!harvest) {

        throw new Error(
            "Harvest not found."
        );

    }


    return harvest;

};


/*
 * Delete Harvest
 */
export const deleteHarvest = async (
    userId,
    harvestId
) => {

    await getHarvestById(
        userId,
        harvestId
    );


    await prisma.harvest.delete({

        where: {

            id:
                harvestId

        }

    });


    return {

        message:
            "Harvest deleted successfully."

    };

};


/*
 * Get Harvest Summary
 */
export const getHarvestSummary = async (
    userId
) => {

    const harvests =
        await getHarvests(userId);


    const totalProduction =
        harvests.reduce(
            (sum, item) =>
                sum + item.production,
            0
        );


    const totalRevenue =
        harvests.reduce(
            (sum, item) =>
                sum + item.revenue,
            0
        );


    const totalProfit =
        harvests.reduce(
            (sum, item) =>
                sum + item.profit,
            0
        );


    return {

        totalHarvests:
            harvests.length,

        totalProduction,

        totalRevenue,

        totalProfit

    };

};