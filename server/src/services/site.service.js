import prisma from "../config/prisma.js";

import {
    getUserFarm
} from "../utils/farm.helpers.js";


/*
 * Create a new Site
 */
export const createSite = async (userId, siteData) => {

    const farm = await getUserFarm(userId);

    const site = await prisma.site.create({

        data: {

            siteName: siteData.siteName,

            location: siteData.location,

            area: siteData.area,

            gpsLocation: siteData.gpsLocation ?? null,

            remarks: siteData.remarks ?? null,

            farmId: farm.id

        }

    });

    return site;
};


/*
 * Get all Sites belonging to the logged-in user's Farm
 */
export const getSites = async (userId) => {

    const farm = await getUserFarm(userId);

    const sites = await prisma.site.findMany({

        where: {

            farmId: farm.id

        },

        include: {

            tanks: true

        },

        orderBy: {

            createdAt: "desc"

        }

    });

    return sites;
};


/*
 * Get a single Site
 */
export const getSiteById = async (
    userId,
    siteId
) => {

    const farm = await getUserFarm(userId);

    const site = await prisma.site.findFirst({

        where: {

            id: siteId,

            farmId: farm.id

        },

        include: {

            tanks: true

        }

    });

    if (!site) {

        throw new Error("Site not found.");

    }

    return site;
};


/*
 * Update a Site
 */
export const updateSite = async (
    userId,
    siteId,
    siteData
) => {

    await getSiteById(
        userId,
        siteId
    );

    const updateData = {
        ...siteData
    };

    const site = await prisma.site.update({

        where: {

            id: siteId

        },

        data: updateData

    });

    return site;
};


/*
 * Delete a Site
 */
export const deleteSite = async (
    userId,
    siteId
) => {

    await getSiteById(
        userId,
        siteId
    );

    await prisma.site.delete({

        where: {

            id: siteId

        }

    });

    return {

        message: "Site deleted successfully."

    };
};