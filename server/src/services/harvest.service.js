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
    const farm = await getUserFarm(userId);

    const tank = await getUserTank(
        farm.id,
        harvestData.tankId
    );

    // Get active crop for this tank
    const crop = await getActiveCrop(tank.id);

    if (crop.status === "COMPLETED") {
        throw new Error("This crop has already been completed with a Final Harvest.");
    }

    // Determine sequence number per crop
    const existingCount = await prisma.harvest.count({
        where: { cropId: crop.id }
    });

    const harvestNumber = existingCount + 1;
    const harvestType = harvestData.harvestType === "FINAL" ? "FINAL" : "INTERMEDIATE";
    const harvestWeight = Number(harvestData.harvestWeight);

    if (isNaN(harvestWeight) || harvestWeight <= 0) {
        throw new Error("Harvest Weight must be a positive number in kg.");
    }

    const sellingPrice = Number(harvestData.sellingPrice);
    const revenue = harvestWeight * sellingPrice;

    /*
     * Feed Cost
     */
    let feeds = [];
    try {
        feeds = await prisma.feedEntry.findMany({
            where: { cropId: crop.id }
        });
    } catch (e) {
        feeds = [];
    }

    const feedCost = feeds.reduce((sum, item) => sum + item.totalCost, 0);

    /*
     * General Expenses
     */
    let expenses = [];
    try {
        expenses = await prisma.expense.findMany({
            where: { cropId: crop.id }
        });
    } catch (e) {
        expenses = [];
    }

    const expenseCost = expenses.reduce((sum, item) => sum + item.amount, 0);

    /*
     * Medicine Cost
     */
    let medicines = [];
    try {
        medicines = await prisma.medicine.findMany({
            where: { tankId: tank.id }
        });
    } catch (e) {
        medicines = [];
    }

    const medicineCost = medicines.reduce((sum, item) => sum + item.cost, 0);

    /*
     * Pond Lease Cost
     */
    let pondLeases = [];
    try {
        if (prisma.pondLease && typeof prisma.pondLease.findMany === 'function') {
            pondLeases = await prisma.pondLease.findMany({
                where: { tankId: tank.id }
            });
        }
    } catch (e) {
        pondLeases = [];
    }

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

    const totalExpense =
        feedCost +
        expenseCost +
        medicineCost +
        (Number(harvestData.harvestExpense) || 0) +
        pondLeaseCost;

    const profit = revenue - totalExpense;

    /*
     * Create Harvest and update Crop Status atomically via Transaction
     */
    const [harvest] = await prisma.$transaction([
        prisma.harvest.create({
            data: {
                cropId: crop.id,
                harvestDate: new Date(harvestData.harvestDate),
                harvestWeight,
                harvestType,
                harvestNumber,
                production: harvestWeight,
                shrimpCount: harvestData.shrimpCount ? Number(harvestData.shrimpCount) : null,
                averageWeight: harvestData.shrimpCount ? (1000 / Number(harvestData.shrimpCount)) : null,
                survivalRate: harvestData.survivalRate ?? 85,
                sellingPrice,
                revenue,
                harvestExpense: Number(harvestData.harvestExpense) || 0,
                profit,
                buyerName: harvestData.buyerName,
                transportationCost: harvestData.transportationCost ? Number(harvestData.transportationCost) : null,
                notes: harvestData.notes ? String(harvestData.notes).trim() : null,
            },
            include: {
                crop: {
                    include: {
                        tank: true
                    }
                }
            }
        }),

        prisma.crop.update({
            where: { id: crop.id },
            data: {
                status: harvestType === "FINAL" ? "COMPLETED" : "ACTIVE"
            }
        })
    ]);

    return harvest;
};

/*
 * Update Harvest
 */
export const updateHarvest = async (
    userId,
    harvestId,
    updateData
) => {
    const existing = await getHarvestById(userId, harvestId);

    const harvestWeightVal = updateData.harvestWeight !== undefined && updateData.harvestWeight !== null
        ? Number(updateData.harvestWeight)
        : (existing.harvestWeight || existing.production || 0);

    const sellingPriceVal = updateData.sellingPrice !== undefined
        ? Number(updateData.sellingPrice)
        : existing.sellingPrice;

    const harvestTypeVal = updateData.harvestType !== undefined
        ? (updateData.harvestType === "FINAL" ? "FINAL" : "INTERMEDIATE")
        : existing.harvestType;

    const revenueVal = harvestWeightVal * sellingPriceVal;

    const harvestExpenseVal = updateData.harvestExpense !== undefined
        ? Number(updateData.harvestExpense)
        : existing.harvestExpense;

    const updatedTotalExpense = ((existing.revenue - existing.profit) - (existing.harvestExpense || 0)) + harvestExpenseVal;
    const profitVal = revenueVal - updatedTotalExpense;

    const [updated] = await prisma.$transaction([
        prisma.harvest.update({
            where: { id: harvestId },
            data: {
                ...(updateData.harvestDate ? { harvestDate: new Date(updateData.harvestDate) } : {}),
                harvestWeight: harvestWeightVal,
                production: harvestWeightVal,
                harvestType: harvestTypeVal,
                ...(updateData.shrimpCount !== undefined ? { shrimpCount: updateData.shrimpCount ? Number(updateData.shrimpCount) : null } : {}),
                ...(updateData.survivalRate !== undefined ? { survivalRate: Number(updateData.survivalRate) } : {}),
                sellingPrice: sellingPriceVal,
                revenue: revenueVal,
                harvestExpense: harvestExpenseVal,
                profit: profitVal,
                ...(updateData.buyerName ? { buyerName: updateData.buyerName } : {}),
                ...(updateData.transportationCost !== undefined ? { transportationCost: updateData.transportationCost ? Number(updateData.transportationCost) : null } : {}),
                ...(updateData.notes !== undefined ? { notes: updateData.notes ? String(updateData.notes).trim() : null } : {}),
            },
            include: {
                crop: {
                    include: {
                        tank: true,
                    },
                },
            },
        }),

        // Recalculate Crop status based on presence of any FINAL harvest
        async (tx) => {
            const hasFinal = await tx.harvest.findFirst({
                where: {
                    cropId: existing.cropId,
                    harvestType: "FINAL"
                }
            });
            return tx.crop.update({
                where: { id: existing.cropId },
                data: {
                    status: hasFinal ? "COMPLETED" : "ACTIVE"
                }
            });
        }
    ]);

    return updated;
};

/*
 * Get all Harvests for User's Farm
 */
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
        orderBy: [
            { harvestDate: "desc" },
            { harvestNumber: "desc" }
        ]
    });
};

/*
 * Get Harvest by ID
 */
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
        throw new Error("Harvest record not found.");
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
    const existing = await getHarvestById(userId, harvestId);

    await prisma.$transaction(async (tx) => {
        // Delete harvest
        await tx.harvest.delete({
            where: { id: harvestId }
        });

        // Recalculate remaining harvests for crop
        const remainingFinal = await tx.harvest.findFirst({
            where: {
                cropId: existing.cropId,
                harvestType: "FINAL"
            }
        });

        // Revert to ACTIVE if no FINAL harvest remains
        await tx.crop.update({
            where: { id: existing.cropId },
            data: {
                status: remainingFinal ? "COMPLETED" : "ACTIVE"
            }
        });
    });

    return {
        message: "Harvest deleted successfully."
    };
};

/*
 * Get Harvest Summary
 */
export const getHarvestSummary = async (userId) => {
    const harvests = await getHarvests(userId);

    const totalProduction = harvests.reduce(
        (sum, item) => sum + (item.harvestWeight || item.production || 0),
        0
    );

    const totalRevenue = harvests.reduce(
        (sum, item) => sum + item.revenue,
        0
    );

    const totalProfit = harvests.reduce(
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