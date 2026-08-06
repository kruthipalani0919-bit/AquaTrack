import prisma from "../config/prisma.js";

export const getUserFarm = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    return farm;

};

export const getUserTank = async (farmId, tankId) => {

    const tank = await prisma.tank.findFirst({
        where: {
            id: tankId,
            farmId
        }
    });

    if (!tank) {
        throw new Error("Tank not found.");
    }

    return tank;

};

export const getActiveCrop = async (tankId) => {

    const crop = await prisma.crop.findFirst({
        where: {
            tankId,
            status: "ACTIVE"
        }
    });

    if (!crop) {
        throw new Error("No active crop found.");
    }

    return crop;

};