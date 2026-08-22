import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank
} from "../utils/farm.helpers.js";

/* ---------------------------------------------
   Get all tanks for Reports page
----------------------------------------------*/

export const getReportTanks = async (userId) => {

    const farm = await getUserFarm(userId);

    const tanks = await prisma.tank.findMany({

        where: {

            site: {

                farmId: farm.id

            }

        },

        select: {

            id: true,

            tankName: true,

            area: true,

            depth: true,

            waterSource: true

        },

        orderBy: {

            tankName: "asc"

        }

    });

    return tanks;

};

/* ---------------------------------------------
   Get Active Crop Report
----------------------------------------------*/

export const getActiveTankReport = async (

    userId,

    tankId

) => {

    const farm = await getUserFarm(userId);

    const tank = await getUserTank(

        farm.id,

        tankId

    );

    const crop = await prisma.crop.findFirst({

        where: {

            tankId: tank.id,

            status: "ACTIVE"

        }

    });

    if (!crop) {

        throw new Error("No active crop found for this tank.");

    }

    return await buildReport(

        tank,

        crop

    );

};

/* ---------------------------------------------
   Get Completed Crops List
----------------------------------------------*/

export const getCompletedCrops = async (

    userId,

    tankId

) => {

    const farm = await getUserFarm(userId);

    const tank = await getUserTank(

        farm.id,

        tankId

    );

    const completedCrops = await prisma.crop.findMany({

        where: {

            tankId: tank.id,

            status: "COMPLETED"

        },

        select: {

            id: true,

            cropName: true,

            stockingDate: true,

            expectedHarvestDate: true,

            cropDuration: true

        },

        orderBy: {

            stockingDate: "desc"

        }

    });

    return completedCrops;

};

/* ---------------------------------------------
   Get Completed Crop Report
----------------------------------------------*/

export const getCompletedCropReport = async (

    userId,

    cropId

) => {

    const farm = await getUserFarm(userId);

    const crop = await prisma.crop.findFirst({

        where: {

            id: cropId,

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        },

        include: {

            tank: true

        }

    });

    if (!crop) {

        throw new Error("Crop not found.");

    }

    return await buildReport(

        crop.tank,

        crop

    );

};

/* ---------------------------------------------
   Helper: Calculate Crop Pond Lease Cost
----------------------------------------------*/
const getCropPondLeaseCost = async (tankId, crop) => {
    const pondLeases = await prisma.pondLease.findMany({
        where: { tankId }
    });

    if (!pondLeases || pondLeases.length === 0) return 0;

    const cropStartDate = new Date(crop.stockingDate);

    let cropEndDate;
    if (crop.status === "ACTIVE") {
        cropEndDate = new Date();
    } else {
        const harvest = await prisma.harvest.findFirst({
            where: { cropId: crop.id },
            orderBy: { harvestDate: "desc" }
        });
        cropEndDate = harvest?.harvestDate
            ? new Date(harvest.harvestDate)
            : crop.expectedHarvestDate
                ? new Date(crop.expectedHarvestDate)
                : new Date(crop.updatedAt);
    }

    let totalCost = 0;
    for (const lease of pondLeases) {
        const leaseStart = new Date(lease.leaseStartDate);
        const leaseEnd = new Date(lease.leaseEndDate);

        leaseStart.setUTCHours(0, 0, 0, 0);
        leaseEnd.setUTCHours(0, 0, 0, 0);

        if (leaseEnd >= leaseStart) {
            const diffTime = leaseEnd.getTime() - leaseStart.getTime();
            const totalLeaseDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const dailyLeaseCost = totalLeaseDays > 0 ? (lease.totalLeaseAmount / totalLeaseDays) : 0;

            const startNorm = new Date(cropStartDate);
            const endNorm = new Date(cropEndDate);
            startNorm.setUTCHours(0, 0, 0, 0);
            endNorm.setUTCHours(0, 0, 0, 0);

            const cropOverlapStart = startNorm > leaseStart ? startNorm : leaseStart;
            const cropOverlapEnd = endNorm < leaseEnd ? endNorm : leaseEnd;

            if (cropOverlapStart <= cropOverlapEnd) {
                const overlapTime = cropOverlapEnd.getTime() - cropOverlapStart.getTime();
                const overlappingDays = Math.round(overlapTime / (1000 * 60 * 60 * 24)) + 1;
                totalCost += Math.round(dailyLeaseCost * Math.max(0, overlappingDays) * 100) / 100;
            }
        }
    }

    return Math.round(totalCost * 100) / 100;
};

/* ---------------------------------------------
   Shared Report Builder
----------------------------------------------*/

const buildReport = async (

    tank,

    crop

) => {

    const feedEntries = await prisma.feedEntry.findMany({

        where: {

            cropId: crop.id

        },

        orderBy: {

            date: "desc"

        }

    });

    const medicines = await prisma.medicine.findMany({

        where: {

            tankId: tank.id

        },

        orderBy: {

            date: "desc"

        }

    });

    const expenses = await prisma.expense.findMany({

        where: {

            cropId: crop.id

        },

        orderBy: {

            date: "desc"

        }

    });

    const totalPondLeaseCost = await getCropPondLeaseCost(tank.id, crop);

    const totalFeedCost = feedEntries.reduce(

        (sum, item) => sum + item.totalCost,

        0

    );

    const totalMedicineCost = medicines.reduce(

        (sum, item) => sum + item.cost,

        0

    );

    const totalExpenseCost = expenses.reduce(

        (sum, item) => sum + item.amount,

        0

    );

    const totalExpenses =

        totalFeedCost +

        totalMedicineCost +

        totalExpenseCost +

        totalPondLeaseCost;

    const categoryBreakdown = {};

    expenses.forEach(expense => {

        if (!categoryBreakdown[expense.category]) {

            categoryBreakdown[expense.category] = 0;

        }

        categoryBreakdown[expense.category] += expense.amount;

    });

    categoryBreakdown["Feed"] = totalFeedCost;

    categoryBreakdown["Medicine"] = totalMedicineCost;

    if (totalPondLeaseCost > 0 || !categoryBreakdown["Pond Lease"]) {

        categoryBreakdown["Pond Lease"] = (categoryBreakdown["Pond Lease"] || 0) + totalPondLeaseCost;

    }

    const pieChartData = Object.entries(

        categoryBreakdown

    ).map(

        ([category, amount]) => ({

            category,

            amount

        })

    );

    const today = new Date();

    const currentDay = Math.floor(

        (today - crop.stockingDate) /

        (1000 * 60 * 60 * 24)

    );

    return {

        tank: {

            id: tank.id,

            tankName: tank.tankName,

            area: tank.area,

            depth: tank.depth,

            waterSource: tank.waterSource

        },

        crop: {

            id: crop.id,

            cropName: crop.cropName,

            status: crop.status,

            stockingDate: crop.stockingDate,

            expectedHarvestDate: crop.expectedHarvestDate,

            cropDuration: crop.cropDuration,

            currentDay:

                crop.status === "ACTIVE"

                    ? currentDay

                    : crop.cropDuration

        },

        summary: {

            totalFeedCost,

            totalMedicineCost,

            totalExpenseCost,

            totalPondLeaseCost,

            totalExpenses

        },

        expenseBreakdown: pieChartData,

        feedHistory: feedEntries,

        medicineHistory: medicines,

        expenseHistory: expenses

    };

};