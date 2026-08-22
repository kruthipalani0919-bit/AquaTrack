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
        harvestData.averageWeight
            ? Number(harvestData.averageWeight)
            : (harvestData.shrimpCount ? 1000 / harvestData.shrimpCount : 0);

    const productionVal =
        harvestData.production !== undefined && harvestData.production !== null
            ? harvestData.production
            : (harvestData.shrimpCount ?? 0);

    /*
     * Revenue
     */
    const revenue =
        productionVal *
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
     * Pond Lease Cost
     */
    const pondLeases = await prisma.pondLease.findMany({
        where: { tankId: tank.id }
    });

    let pondLeaseCost = 0;
    if (pondLeases && pondLeases.length > 0) {
        const cropStart = new Date(crop.stockingDate);
        const cropEnd = harvestData.harvestDate ? new Date(harvestData.harvestDate) : new Date();

        for (const lease of pondLeases) {
            const leaseStart = new Date(lease.leaseStartDate);
            const leaseEnd = new Date(lease.leaseEndDate);

            leaseStart.setUTCHours(0, 0, 0, 0);
            leaseEnd.setUTCHours(0, 0, 0, 0);

            if (leaseEnd >= leaseStart) {
                const totalLeaseDays = Math.round((leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const dailyLeaseCost = totalLeaseDays > 0 ? (lease.totalLeaseAmount / totalLeaseDays) : 0;

                const startNorm = new Date(cropStart);
                const endNorm = new Date(cropEnd);
                startNorm.setUTCHours(0, 0, 0, 0);
                endNorm.setUTCHours(0, 0, 0, 0);

                const cropOverlapStart = startNorm > leaseStart ? startNorm : leaseStart;
                const cropOverlapEnd = endNorm < leaseEnd ? endNorm : leaseEnd;

                if (cropOverlapStart <= cropOverlapEnd) {
                    const overlappingDays = Math.round((cropOverlapEnd.getTime() - cropOverlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    pondLeaseCost += Math.round(dailyLeaseCost * Math.max(0, overlappingDays) * 100) / 100;
                }
            }
        }
    }


    /*
     * Total Expense
     *
     * Includes Feed, Medicine, General Expense, Harvest Expense, and Pond Lease Cost.
     */
    const totalExpense =
        feedCost +
        expenseCost +
        medicineCost +
        harvestData.harvestExpense +
        pondLeaseCost;


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
                    harvestData.production ?? harvestData.shrimpCount ?? null,


                /*
                 * Store user-entered shrimp count
                 */
                shrimpCount:
                    harvestData.shrimpCount ?? null,


                /*
                 * Store automatically calculated ABW
                 */
                averageWeight,


                survivalRate:
                    harvestData.survivalRate ?? 85,

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
                    harvestData.harvestExpense || 0,

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
                sum + (item.production ?? item.shrimpCount ?? 0),
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