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

            farmId: farm.id

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

                farmId: farm.id

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

        totalExpenseCost;

    const categoryBreakdown = {};

    expenses.forEach(expense => {

        if (!categoryBreakdown[expense.category]) {

            categoryBreakdown[expense.category] = 0;

        }

        categoryBreakdown[expense.category] += expense.amount;

    });

    categoryBreakdown["Feed"] = totalFeedCost;

    categoryBreakdown["Medicine"] = totalMedicineCost;

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

            totalExpenses

        },

        expenseBreakdown: pieChartData,

        feedHistory: feedEntries,

        medicineHistory: medicines,

        expenseHistory: expenses

    };

};