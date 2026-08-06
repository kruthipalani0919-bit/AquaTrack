import prisma from "../config/prisma.js";

export const createFarm = async (userId, farmData) => {

    const existingFarm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (existingFarm) {
        throw new Error("Farm already exists for this user.");
    }

    const farm = await prisma.farm.create({

        data: {
            ...farmData,
            userId
        }

    });

    return farm;

};

export const getFarm = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Farm not found.");
    }

    return farm;

};

export const updateFarm = async (userId, farmId, farmData) => {

    const existingFarm = await prisma.farm.findFirst({
        where: {
            id: farmId,
            userId
        }
    });

    if (!existingFarm) {
        throw new Error("Farm not found or unauthorized.");
    }

    const updatedFarm = await prisma.farm.update({
        where: {
            id: farmId
        },
        data: farmData
    });

    return updatedFarm;

};

export const deleteFarm = async (userId, farmId) => {

    const existingFarm = await prisma.farm.findFirst({
        where: {
            id: farmId,
            userId
        }
    });

    if (!existingFarm) {
        throw new Error("Farm not found or unauthorized.");
    }

    await prisma.farm.delete({
        where: {
            id: farmId
        }
    });

    return { message: "Farm deleted successfully" };

};