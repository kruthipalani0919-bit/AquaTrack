import prisma from "../config/prisma.js";


/*
 * Create Crop
 *
 * Current Crop registration UI only requires:
 * - Tank
 * - Stocking Date
 * - Seed Variety
 * - Batch Number
 * - Notes (optional)
 *
 * Other legacy Crop fields are stored as null.
 */
export const createCrop = async (userId, cropData) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }


    /*
     * Verify that the selected Tank
     * belongs to the logged-in user's Farm.
     */
    const tank = await prisma.tank.findFirst({
        where: {
            id: cropData.tankId,
            site: {
                farmId: farm.id
            }
        }
    });

    if (!tank) {
        throw new Error("Tank not found.");
    }


    /*
     * Only one ACTIVE crop is allowed
     * in a Tank at a time.
     */
    const activeCrop = await prisma.crop.findFirst({
        where: {
            tankId: cropData.tankId,
            status: "ACTIVE"
        }
    });

    if (activeCrop) {
        throw new Error(
            "This tank already has an active crop."
        );
    }


    /*
     * Create Crop using only the fields
     * currently required by the frontend.
     *
     * Legacy fields are intentionally set to null.
     */
    const crop = await prisma.crop.create({

        data: {

            tankId: cropData.tankId,

            stockingDate:
                new Date(cropData.stockingDate),

            seedQuantity:
                cropData.seedQuantity,

            seedVariety:
                cropData.seedVariety,

            batchNumber:
                cropData.batchNumber,

            notes:
                cropData.notes ?? null,

            /*
             * Legacy fields not currently used
             * by the Crop registration UI.
             */
            cropName: null,

            plCount: null,

            expectedHarvestDate: null,

            cropDuration: null,

            expectedProduction: null,

            expectedSellingPrice: null,

            status: "ACTIVE"

        }

    });

    return crop;

};


/*
 * Get all Crops
 */
export const getCrops = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const crops = await prisma.crop.findMany({
        where: {
            tank: {
                site: {
                    farmId: farm.id
                }
            }
        },
        include: {
            tank: {
                include: {
                    site: true,
                    pondLeases: true,
                    medicines: true
                }
            },
            feedEntries: true,
            expenses: true,
            harvests: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return crops;

};


/*
 * Get Active Crops
 */
export const getActiveCrops = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const activeCrops = await prisma.crop.findMany({

        where: {

            status: "ACTIVE",

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    return activeCrops;

};


/*
 * Get Crop by ID
 */
export const getCropById = async (
    userId,
    cropId
) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const crop = await prisma.crop.findFirst({

        where: {

            id: cropId,

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    if (!crop) {
        throw new Error("Crop not found.");
    }

    return crop;

};


/*
 * Update Crop
 *
 * Supports the current Crop fields while
 * preserving the existing tank ownership
 * and active-crop validation logic.
 */
export const updateCrop = async (
    userId,
    cropId,
    cropData
) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }


    const existingCrop = await prisma.crop.findFirst({

        where: {

            id: cropId,

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    if (!existingCrop) {
        throw new Error("Crop not found.");
    }


    const updateData = {
        ...cropData
    };


    /*
     * Convert date strings to Date objects.
     */
    if (updateData.stockingDate) {

        updateData.stockingDate =
            new Date(updateData.stockingDate);

    }


    if (updateData.expectedHarvestDate) {

        updateData.expectedHarvestDate =
            new Date(updateData.expectedHarvestDate);

    }


    /*
     * If Tank is being changed,
     * verify that the new Tank belongs
     * to the same Farm.
     */
    if (
        updateData.tankId &&
        updateData.tankId !== existingCrop.tankId
    ) {

        const targetTank =
            await prisma.tank.findFirst({

                where: {

                    id: updateData.tankId,

                    site: {

                        farmId: farm.id

                    }

                }

            });

        if (!targetTank) {
            throw new Error("Tank not found.");
        }

    }


    /*
     * Preserve existing active-crop protection.
     */
    const targetTankId =
        updateData.tankId ||
        existingCrop.tankId;

    const targetStatus =
        updateData.status ||
        existingCrop.status;


    if (targetStatus === "ACTIVE") {

        const activeCrop =
            await prisma.crop.findFirst({

                where: {

                    tankId: targetTankId,

                    status: "ACTIVE",

                    id: {
                        not: cropId
                    }

                }

            });

        if (activeCrop) {

            throw new Error(
                "This tank already has an active crop."
            );

        }

    }


    const updatedCrop =
        await prisma.crop.update({

            where: {
                id: cropId
            },

            data: updateData

        });

    return updatedCrop;

};


/*
 * Complete Crop
 */
export const completeCrop = async (
    userId,
    cropId
) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }


    const crop = await prisma.crop.findFirst({

        where: {

            id: cropId,

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    if (!crop) {
        throw new Error("Crop not found.");
    }


    const updatedCrop =
        await prisma.crop.update({

            where: {

                id: cropId

            },

            data: {

                status: "COMPLETED"

            }

        });

    return updatedCrop;

};


/*
 * Delete Crop
 */
export const deleteCrop = async (
    userId,
    cropId
) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }


    const crop = await prisma.crop.findFirst({

        where: {

            id: cropId,

            tank: {

                site: {

                    farmId: farm.id

                }

            }

        }

    });

    if (!crop) {
        throw new Error("Crop not found.");
    }


    await prisma.crop.delete({

        where: {

            id: cropId

        }

    });


    return {
        message: "Crop deleted successfully"
    };

};