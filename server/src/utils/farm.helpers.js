import prisma from "../config/prisma.js";


/*
 * Get the Farm belonging to the logged-in user
 */
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


/*
 * Get a Site belonging to the logged-in user's Farm
 */
export const getUserSite = async (
    farmId,
    siteId
) => {

    const site = await prisma.site.findFirst({

        where: {

            id: siteId,

            farmId

        }

    });

    if (!site) {

        throw new Error("Site not found.");

    }

    return site;

};


/*
 * Get a Tank belonging to a Site
 *
 * The Site must belong to the user's Farm.
 */
export const getUserTank = async (
    farmId,
    tankId
) => {

    const tank = await prisma.tank.findFirst({

        where: {

            id: tankId,

            site: {

                farmId

            }

        },

        include: {

            site: true

        }

    });

    if (!tank) {

        throw new Error("Tank not found.");

    }

    return tank;

};


/*
 * Get the active Crop belonging to a Tank
 */
export const getActiveCrop = async (
    tankId
) => {

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