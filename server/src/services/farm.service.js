import prisma from "../config/prisma.js";


/*
 * Create Farm
 */
export const createFarm = async (
    userId,
    farmData
) => {

    const existingFarm = await prisma.farm.findFirst({

        where: {

            userId

        }

    });

    if (existingFarm) {

        throw new Error(
            "Farm already exists for this user."
        );

    }

    const farm = await prisma.farm.create({

        data: {

            farmName: farmData.farmName,

            ownerName: farmData.ownerName,

            location: null,

            district: null,

            state: null,

            totalAcres: null,

            userId

        }

    });

    return farm;

};


/*
 * Get Farm
 */
export const getFarm = async (
    userId
) => {

    const farm = await prisma.farm.findFirst({

        where: {

            userId

        },

        include: {

            sites: {

                include: {

                    tanks: true

                }

            }

        }

    });

    if (!farm) {

        throw new Error(
            "Farm not found."
        );

    }

    return farm;

};


/*
 * Update Farm
 */
export const updateFarm = async (
    userId,
    farmId,
    farmData
) => {

    const existingFarm = await prisma.farm.findFirst({

        where: {

            id: farmId,

            userId

        }

    });

    if (!existingFarm) {

        throw new Error(
            "Farm not found or unauthorized."
        );

    }

    const updatedFarm = await prisma.farm.update({

        where: {

            id: farmId

        },

        data: {

            ...(farmData.farmName !== undefined && {
                farmName: farmData.farmName
            }),

            ...(farmData.ownerName !== undefined && {
                ownerName: farmData.ownerName
            })

        }

    });

    return updatedFarm;

};


/*
 * Delete Farm
 */
export const deleteFarm = async (
    userId,
    farmId
) => {

    const existingFarm = await prisma.farm.findFirst({

        where: {

            id: farmId,

            userId

        }

    });

    if (!existingFarm) {

        throw new Error(
            "Farm not found or unauthorized."
        );

    }

    await prisma.farm.delete({

        where: {

            id: farmId

        }

    });

    return {

        message: "Farm deleted successfully"

    };

};