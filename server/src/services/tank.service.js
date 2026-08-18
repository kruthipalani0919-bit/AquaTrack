import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserSite,
    getUserTank
} from "../utils/farm.helpers.js";


/*
 * Create a new Tank under a Site
 */
export const createTank = async (
    userId,
    tankData
) => {

    const farm = await getUserFarm(userId);

    const site = await getUserSite(
        farm.id,
        tankData.siteId
    );

    const tank = await prisma.tank.create({

        data: {

            tankName: tankData.tankName,

            area: tankData.area,

            depth: tankData.depth,

            waterSource: tankData.waterSource,

            gpsLocation: tankData.gpsLocation ?? null,

            remarks: tankData.remarks ?? null,

            siteId: site.id

        },

        include: {

            site: true

        }

    });

    return tank;

};


/*
 * Get all Tanks belonging to the
 * logged-in user's Farm
 */
export const getTanks = async (userId) => {

    const farm = await getUserFarm(userId);

    const tanks = await prisma.tank.findMany({

        where: {

            site: {

                farmId: farm.id

            }

        },

        include: {

            site: true

        },

        orderBy: {

            createdAt: "desc"

        }

    });

    return tanks;

};


/*
 * Get a single Tank
 */
export const getTankById = async (
    userId,
    tankId
) => {

    const farm = await getUserFarm(userId);

    const tank = await getUserTank(
        farm.id,
        tankId
    );

    return await prisma.tank.findUnique({

        where: {

            id: tank.id

        },

        include: {

            site: true

        }

    });

};


/*
 * Update a Tank
 */
export const updateTank = async (
    userId,
    tankId,
    tankData
) => {

    const farm = await getUserFarm(userId);

    const existingTank = await getUserTank(
        farm.id,
        tankId
    );

    const updateData = {
        ...tankData
    };

    /*
     * If the Site is being changed,
     * verify that the new Site belongs
     * to the logged-in user's Farm.
     */
    if (updateData.siteId) {

        const site = await getUserSite(
            farm.id,
            updateData.siteId
        );

        updateData.siteId = site.id;

    }

    const updatedTank = await prisma.tank.update({

        where: {

            id: existingTank.id

        },

        data: updateData,

        include: {

            site: true

        }

    });

    return updatedTank;

};


/*
 * Delete a Tank
 */
export const deleteTank = async (
    userId,
    tankId
) => {

    const farm = await getUserFarm(userId);

    const existingTank = await getUserTank(
        farm.id,
        tankId
    );

    await prisma.tank.delete({

        where: {

            id: existingTank.id

        }

    });

    return {

        message: "Tank deleted successfully"

    };

};