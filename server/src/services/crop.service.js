import prisma from "../config/prisma.js";

export const createCrop = async (userId, cropData) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const tank = await prisma.tank.findFirst({
        where: {
            id: cropData.tankId,
            farmId: farm.id
        }
    });

    if (!tank) {
        throw new Error("Tank not found.");
    }

    const activeCrop = await prisma.crop.findFirst({
        where: {
            tankId: cropData.tankId,
            status: "ACTIVE"
        }
    });

    if (activeCrop) {
        throw new Error("This tank already has an active crop.");
    }

    const crop = await prisma.crop.create({

        data: {

            tankId: cropData.tankId,

            cropName: cropData.cropName,

            seedVariety: cropData.seedVariety,

            plCount: cropData.plCount,

            stockingDate: new Date(cropData.stockingDate),

            expectedHarvestDate: new Date(cropData.expectedHarvestDate),

            cropDuration: cropData.cropDuration,

            expectedProduction: cropData.expectedProduction,

            expectedSellingPrice: cropData.expectedSellingPrice,

            notes: cropData.notes ?? null,

            status: "ACTIVE"

        }

    });

    return crop;

};

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
                farmId: farm.id
            }
        }
    });

    return crops;

};

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
                farmId: farm.id
            }
        }
    });

    return activeCrops;

};

export const getCropById = async (userId, cropId) => {

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
                farmId: farm.id
            }
        }
    });

    if (!crop) {
        throw new Error("Crop not found.");
    }

    return crop;

};

export const updateCrop = async (userId, cropId, cropData) => {

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
                farmId: farm.id
            }
        }
    });

    if (!existingCrop) {
        throw new Error("Crop not found.");
    }

    const updateData = { ...cropData };

    if (updateData.stockingDate) {
        updateData.stockingDate = new Date(updateData.stockingDate);
    }

    if (updateData.expectedHarvestDate) {
        updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);
    }

    if (updateData.tankId && updateData.tankId !== existingCrop.tankId) {
        const targetTank = await prisma.tank.findFirst({
            where: {
                id: updateData.tankId,
                farmId: farm.id
            }
        });

        if (!targetTank) {
            throw new Error("Tank not found.");
        }
    }

    const targetTankId = updateData.tankId || existingCrop.tankId;
    const targetStatus = updateData.status || existingCrop.status;

    if (targetStatus === "ACTIVE") {
        const activeCrop = await prisma.crop.findFirst({
            where: {
                tankId: targetTankId,
                status: "ACTIVE",
                id: {
                    not: cropId
                }
            }
        });

        if (activeCrop) {
            throw new Error("This tank already has an active crop.");
        }
    }

    const updatedCrop = await prisma.crop.update({
        where: {
            id: cropId
        },
        data: updateData
    });

    return updatedCrop;

};

export const completeCrop = async (userId, cropId) => {

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
                farmId: farm.id
            }
        }
    });

    if (!crop) {
        throw new Error("Crop not found.");
    }

    const updatedCrop = await prisma.crop.update({
        where: {
            id: cropId
        },
        data: {
            status: "COMPLETED"
        }
    });

    return updatedCrop;

};

export const deleteCrop = async (userId, cropId) => {

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
                farmId: farm.id
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

    return { message: "Crop deleted successfully" };

};