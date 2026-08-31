import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserTank
} from "../utils/farm.helpers.js";


/*
 * Get Medicine Stock availability for a Site
 *
 * Total Medicine allocated to Site
 *              -
 * Medicine already used
 *              =
 * Remaining Medicine
 */
const getSiteMedicineAvailability = async (
    farmId,
    siteId,
    excludeMedicineId = null
) => {

    /*
     * Get total MEDICINE added directly to this Site
     * plus legacy allocations.
     */
    const directStockResult =
        await prisma.stocking.aggregate({
            where: {
                siteId,
                farmId,
                category: "MEDICINE"
            },
            _sum: {
                totalQuantity: true
            }
        });

    const allocationResult =
        await prisma.siteStockAllocation.aggregate({

            where: {

                siteId,

                stocking: {

                    farmId,

                    category: "MEDICINE"

                }

            },

            _sum: {

                allocatedQuantity: true

            }

        });


    const allocatedMedicine =
        (directStockResult._sum.totalQuantity ?? 0) +
        (allocationResult._sum.allocatedQuantity ?? 0);


    /*
     * Get total Medicine already used
     * at this Site.
     */
    const medicineUsageWhere = {

        tank: {

            site: {

                id: siteId,

                farmId

            }

        }

    };


    /*
     * When updating an existing Medicine entry,
     * exclude that entry from the usage calculation.
     */
    if (excludeMedicineId) {

        medicineUsageWhere.id = {

            not: excludeMedicineId

        };

    }


    const usageResult =
        await prisma.medicine.aggregate({

            where: medicineUsageWhere,

            _sum: {

                quantity: true

            }

        });


    const usedMedicine =
        usageResult._sum.quantity ?? 0;


    const remainingMedicine =
        allocatedMedicine - usedMedicine;


    return {

        allocatedMedicine,

        usedMedicine,

        remainingMedicine

    };

};


/*
 * Create Medicine
 */
export const createMedicine = async (
    userId,
    medicineData
) => {

    const farm =
        await getUserFarm(userId);


    /*
     * Verify that the Tank belongs
     * to the logged-in user's Farm.
     */
    const tank =
        await getUserTank(

            farm.id,

            medicineData.tankId

        );


    /*
     * Check Medicine Stock available
     * for this Tank's Site.
     */
    const stock =
        await getSiteMedicineAvailability(

            farm.id,

            tank.siteId

        );


    /*
     * Medicine must be allocated to
     * the Site before it can be used.
     */
    if (
        stock.allocatedMedicine <= 0
    ) {

        throw new Error(
            "No medicine stock has been allocated to this site."
        );

    }


    /*
     * Prevent Medicine usage from
     * exceeding the remaining Site stock.
     */
    if (
        medicineData.quantity >
        stock.remainingMedicine
    ) {

        throw new Error(
            `Insufficient medicine stock. Only ${stock.remainingMedicine} is remaining for this site.`
        );

    }


    const medicine =
        await prisma.medicine.create({

            data: {

                tankId:
                    tank.id,

                medicineName:
                    medicineData.medicineName,

                purpose:
                    medicineData.purpose,

                dosage:
                    medicineData.dosage,

                quantity:
                    medicineData.quantity,

                cost:
                    medicineData.cost,

                date:
                    new Date(
                        medicineData.date
                    ),

                notes:
                    medicineData.notes ?? null

            }

        });


    return medicine;

};


/*
 * Get all Medicines
 */
export const getMedicines = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const medicines =
        await prisma.medicine.findMany({

            where: {

                tank: {

                    site: {

                        farmId:
                            farm.id

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


/*
 * Get Medicine by ID
 */
export const getMedicineById = async (
    userId,
    medicineId
) => {

    const farm =
        await getUserFarm(userId);


    const medicine =
        await prisma.medicine.findFirst({

            where: {

                id:
                    medicineId,

                tank: {

                    site: {

                        farmId:
                            farm.id

                    }

                }

            },

            include: {

                tank: true

            }

        });


    if (!medicine) {

        throw new Error(
            "Medicine entry not found."
        );

    }


    return medicine;

};


/*
 * Update Medicine
 */
export const updateMedicine = async (
    userId,
    medicineId,
    medicineData
) => {

    /*
     * Verify the Medicine entry belongs
     * to the logged-in user's Farm.
     */
    const existingMedicine =
        await getMedicineById(

            userId,

            medicineId

        );


    /*
     * Get the user's Farm.
     */
    const farm =
        await getUserFarm(userId);


    /*
     * Keep the existing Tank because
     * changing tankId is not part of the
     * current Medicine update functionality.
     */
    const tank =
        await getUserTank(

            farm.id,

            existingMedicine.tank.id

        );


    /*
     * Calculate the new quantity.
     *
     * If quantity is not supplied during
     * update, keep the existing quantity.
     */
    const newQuantity =
        medicineData.quantity ??
        existingMedicine.quantity;


    /*
     * Exclude the current Medicine entry
     * from the usage calculation.
     *
     * Example:
     *
     * Existing = 50 kg
     * New      = 70 kg
     *
     * We first remove the old 50 kg from
     * the usage calculation and then check
     * the new 70 kg.
     */
    const stock =
        await getSiteMedicineAvailability(

            farm.id,

            tank.siteId,

            medicineId

        );


    /*
     * Medicine must have been allocated
     * to the Site.
     */
    if (
        stock.allocatedMedicine <= 0
    ) {

        throw new Error(
            "No medicine stock has been allocated to this site."
        );

    }


    /*
     * Prevent the updated quantity from
     * exceeding available stock.
     */
    if (
        newQuantity >
        stock.remainingMedicine
    ) {

        throw new Error(
            `Insufficient medicine stock. Only ${stock.remainingMedicine} is remaining for this site.`
        );

    }


    /*
     * Prepare only the fields that were
     * provided for the update.
     */
    const updateData = {

        medicineName:
            medicineData.medicineName ??
            undefined,

        purpose:
            medicineData.purpose ??
            undefined,

        dosage:
            medicineData.dosage ??
            undefined,

        quantity:
            newQuantity,

        cost:
            medicineData.cost ??
            undefined,

        date:
            medicineData.date
                ? new Date(
                    medicineData.date
                )
                : undefined,

        notes:
            medicineData.notes ??
            undefined

    };


    const medicine =
        await prisma.medicine.update({

            where: {

                id:
                    medicineId

            },

            data:
                updateData

        });


    return medicine;

};


/*
 * Delete Medicine
 */
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

            id:
                medicineId

        }

    });


    return {

        message:
            "Medicine entry deleted successfully."

    };

};


/*
 * Get Medicine Summary
 */
export const getMedicineSummary = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const medicines =
        await prisma.medicine.findMany({

            where: {

                tank: {

                    site: {

                        farmId:
                            farm.id

                    }

                }

            }

        });


    const totalCost =
        medicines.reduce(

            (sum, item) =>
                sum + item.cost,

            0

        );


    return {

        totalEntries:
            medicines.length,

        totalCost

    };

};