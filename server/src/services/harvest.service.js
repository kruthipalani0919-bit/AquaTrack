import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank,
    getActiveCrop
} from "../utils/farm.helpers.js";

export const createHarvest = async (userId, harvestData) => {

    const farm = await getUserFarm(userId);

    const tank = await getUserTank(
        farm.id,
        harvestData.tankId
    );

    const crop = await getActiveCrop(
        tank.id
    );

    // Revenue
    const revenue =
        harvestData.production *
        harvestData.sellingPrice;

    // Feed Cost
    const feedEntries = await prisma.feedEntry.findMany({
    where: {
        cropId: crop.id
    }
});

    const feedCost = feedEntries.reduce(
        (sum, item) => sum + item.totalCost,
        0
    );

    // Expense Cost
    const expenses = await prisma.expense.findMany({
        where: {
            cropId: crop.id
        }
    });

    const expenseCost = expenses.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    // Medicine Cost
    const medicines = await prisma.medicine.findMany({
        where: {
            tankId: tank.id
        }
    });

    const medicineCost = medicines.reduce(
        (sum, item) => sum + item.cost,
        0
    );

    const totalExpense =
        feedCost +
        expenseCost +
        medicineCost +
        harvestData.transportationCost +
        harvestData.harvestExpense;

    const profit =
        revenue -
        totalExpense;

    const harvest = await prisma.harvest.create({

        data: {

            cropId: crop.id,

            harvestDate: new Date(
                harvestData.harvestDate
            ),

            production: harvestData.production,

            averageWeight: harvestData.averageWeight,

            survivalRate: harvestData.survivalRate,

            sellingPrice: harvestData.sellingPrice,

            buyerName: harvestData.buyerName,

            transportationCost:
                harvestData.transportationCost,

            harvestExpense:
                harvestData.harvestExpense,

            revenue,

            profit

        }

    });

    await prisma.crop.update({

        where: {

            id: crop.id

        },

        data: {

            status: "COMPLETED"

        }

    });

    return harvest;

};

export const getHarvests = async (userId) => {

    const farm = await getUserFarm(userId);

    return await prisma.harvest.findMany({

        where: {

            crop: {

                tank: {

                    site: {

                        farmId: farm.id

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

            harvestDate: "desc"

        }

    });

};

export const getHarvestById = async (
    userId,
    harvestId
) => {

    const farm = await getUserFarm(userId);

    const harvest = await prisma.harvest.findFirst({

        where: {

            id: harvestId,

            crop: {

                tank: {

                    site: {

                        farmId: farm.id

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

    if (!harvest) {

        throw new Error("Harvest not found.");

    }

    return harvest;

};

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

            id: harvestId

        }

    });

    return {

        message: "Harvest deleted successfully."

    };

};

export const getHarvestSummary = async (
    userId
) => {

    const harvests =
        await getHarvests(userId);

    const totalProduction =
        harvests.reduce(
            (sum, item) => sum + item.production,
            0
        );

    const totalRevenue =
        harvests.reduce(
            (sum, item) => sum + item.revenue,
            0
        );

    const totalProfit =
        harvests.reduce(
            (sum, item) => sum + item.profit,
            0
        );

    return {

        totalHarvests: harvests.length,

        totalProduction,

        totalRevenue,

        totalProfit

    };

};