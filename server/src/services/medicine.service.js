import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank
} from "../utils/farm.helpers.js";

export const createMedicine = async (userId, medicineData) => {

    const farm = await getUserFarm(userId);

    const tank = await getUserTank(
        farm.id,
        medicineData.tankId
    );

    const medicine = await prisma.medicine.create({

        data: {

            tankId: tank.id,

            medicineName: medicineData.medicineName,

            purpose: medicineData.purpose,

            dosage: medicineData.dosage,

            quantity: medicineData.quantity,

            cost: medicineData.cost,

            date: new Date(medicineData.date),

            notes: medicineData.notes ?? null

        }

    });

    return medicine;

};

export const getMedicines = async (userId) => {

    const farm = await getUserFarm(userId);

    const medicines = await prisma.medicine.findMany({

        where: {

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        },

        include: {

            tank: true

        },

        orderBy: {

            date: "desc"

        }

    });

    return medicines;

};

export const getMedicineById = async (
    userId,
    medicineId
) => {

    const farm = await getUserFarm(userId);

    const medicine = await prisma.medicine.findFirst({

        where: {

            id: medicineId,

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

    if (!medicine) {

        throw new Error("Medicine entry not found.");

    }

    return medicine;

};

export const updateMedicine = async (
    userId,
    medicineId,
    medicineData
) => {

    await getMedicineById(
        userId,
        medicineId
    );

    const updateData = {
        ...medicineData
    };

    if (updateData.date) {

        updateData.date = new Date(updateData.date);

    }

    delete updateData.tankId;

    const medicine = await prisma.medicine.update({

        where: {

            id: medicineId

        },

        data: updateData

    });

    return medicine;

};

export const deleteMedicine = async (
    userId,
    medicineId
) => {

    await getMedicineById(
        userId,
        medicineId
    );

    await prisma.medicine.delete({

        where: {

            id: medicineId

        }

    });

    return {

        message: "Medicine entry deleted successfully."

    };

};

export const getMedicineSummary = async (
    userId
) => {

    const farm = await getUserFarm(userId);

    const medicines = await prisma.medicine.findMany({

        where: {

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    const totalCost = medicines.reduce(

        (sum, item) => sum + item.cost,

        0

    );

    return {

        totalEntries: medicines.length,

        totalCost

    };

};