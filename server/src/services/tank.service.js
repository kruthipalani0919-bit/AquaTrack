import prisma from "../config/prisma.js";

export const createTank = async (userId, tankData) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const tank = await prisma.tank.create({

        data: {

            tankName: tankData.tankName,

            area: tankData.area,

            depth: tankData.depth,

            waterSource: tankData.waterSource,

            remarks: tankData.remarks ?? null,

            gpsLocation: null,

            farmId: farm.id

        }

    });

    return tank;

};

export const getTanks = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const tanks = await prisma.tank.findMany({
        where: {
            farmId: farm.id
        }
    });

    return tanks;

};

export const getTankById = async (userId, tankId) => {

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
            id: tankId,
            farmId: farm.id
        }
    });

    if (!tank) {
        throw new Error("Tank not found.");
    }

    return tank;

};

export const updateTank = async (userId, tankId, tankData) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const existingTank = await prisma.tank.findFirst({
        where: {
            id: tankId,
            farmId: farm.id
        }
    });

    if (!existingTank) {
        throw new Error("Tank not found.");
    }

    const updatedTank = await prisma.tank.update({
        where: {
            id: tankId
        },
        data: tankData
    });

    return updatedTank;

};

export const deleteTank = async (userId, tankId) => {

    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const existingTank = await prisma.tank.findFirst({
        where: {
            id: tankId,
            farmId: farm.id
        }
    });

    if (!existingTank) {
        throw new Error("Tank not found.");
    }

    await prisma.tank.delete({
        where: {
            id: tankId
        }
    });

    return { message: "Tank deleted successfully" };

};