import prisma from "../config/prisma.js";


/*
 * Get the logged-in user's Farm
 */
const getUserFarm = async (userId) => {

    const farm = await prisma.farm.findFirst({

        where: {
            userId
        }

    });

    if (!farm) {

        throw new Error(
            "Please create a farm first."
        );

    }

    return farm;

};


/*
 * Get the Site belonging to a Tank
 */
const getTankWithSite = async (
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

        throw new Error(
            "Tank not found."
        );

    }

    return tank;

};


/*
 * Check Feed Stock availability for a Site
 *
 * Total allocated Feed
 *        -
 * Feed already used
 *        =
 * Available Feed
 */
const getSiteFeedAvailability = async (
    farmId,
    siteId,
    excludeFeedId = null
) => {

    /*
     * Get total FEED allocated
     * to this Site.
     */
    const allocationResult =
        await prisma.siteStockAllocation.aggregate({

            where: {

                siteId,

                stocking: {

                    farmId,

                    category: "FEED"

                }

            },

            _sum: {

                allocatedQuantity: true

            }

        });

    const allocatedFeed =
        allocationResult._sum
            .allocatedQuantity ?? 0;


    /*
     * Get total Feed already used
     * by Feed Management for this Site.
     */
    const feedUsageWhere = {

        crop: {

            tank: {

                site: {

                    id: siteId,

                    farmId

                }

            }

        }

    };

    /*
     * When updating an existing Feed entry,
     * exclude that entry from the current
     * usage calculation.
     */
    if (excludeFeedId) {

        feedUsageWhere.id = {

            not: excludeFeedId

        };

    }


    const usageResult =
        await prisma.feedEntry.aggregate({

            where: feedUsageWhere,

            _sum: {

                quantity: true

            }

        });

    const usedFeed =
        usageResult._sum.quantity ?? 0;


    const remainingFeed =
        allocatedFeed - usedFeed;


    return {

        allocatedFeed,

        usedFeed,

        remainingFeed

    };

};


/*
 * Create Feed
 */
export const createFeed = async (
    userId,
    feedData
) => {

    const farm = await getUserFarm(userId);


    /*
     * Verify the Tank belongs to
     * the logged-in user's Farm.
     */
    const tank = await getTankWithSite(

        farm.id,

        feedData.tankId

    );


    /*
     * Find active Crop in the selected Tank.
     */
    const crop = await prisma.crop.findFirst({

        where: {

            tankId: tank.id,

            status: "ACTIVE"

        }

    });

    if (!crop) {

        throw new Error(
            "No active crop found for this tank."
        );

    }


    /*
     * Check whether Feed has been
     * allocated to this Site.
     */
    const stock =
        await getSiteFeedAvailability(

            farm.id,

            tank.siteId

        );


    if (stock.allocatedFeed <= 0) {

        throw new Error(
            "No feed stock has been allocated to this site."
        );

    }


    /*
     * Make sure the new Feed entry
     * does not exceed remaining stock.
     */
    if (
        feedData.quantity >
        stock.remainingFeed
    ) {

        throw new Error(
            `Insufficient feed stock. Only ${stock.remainingFeed} kg is remaining for this site.`
        );

    }


    /*
     * Calculate total cost.
     */
    const totalCost =
        feedData.quantity *
        feedData.costPerKg;


    const feed =
        await prisma.feedEntry.create({

            data: {

                cropId: crop.id,

                date: new Date(
                    feedData.date
                ),

                feedType:
                    feedData.feedType,

                feedBrand:
                    feedData.feedBrand,

                feedSize:
                    feedData.feedSize,

                quantity:
                    feedData.quantity,

                costPerKg:
                    feedData.costPerKg,

                totalCost,

                notes:
                    feedData.notes ?? null

            }

        });


    return feed;

};


/*
 * Get all Feeds
 */
export const getFeeds = async (
    userId
) => {

    const farm = await getUserFarm(userId);


    const feeds =
        await prisma.feedEntry.findMany({

            where: {

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                }

            },

            include: {

                crop: {

                    include: {

                        tank: true

                    }

                }

            },

            orderBy: {

                date: "desc"

            }

        });


    return feeds;

};


/*
 * Get Feed by ID
 */
export const getFeedById = async (
    userId,
    feedId
) => {

    const farm = await getUserFarm(userId);


    const feed =
        await prisma.feedEntry.findFirst({

            where: {

                id: feedId,

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                }

            },

            include: {

                crop: {

                    include: {

                        tank: true

                    }

                }

            }

        });


    if (!feed) {

        throw new Error(
            "Feed entry not found."
        );

    }


    return feed;

};


/*
 * Update Feed
 */
export const updateFeed = async (
    userId,
    feedId,
    feedData
) => {

    const existingFeed =
        await getFeedById(

            userId,

            feedId

        );


    /*
     * If Tank is not being changed,
     * continue using the existing Tank.
     */
    const tankId =
        feedData.tankId ??
        existingFeed.crop.tank.id;


    const farm =
        await getUserFarm(userId);


    const tank =
        await getTankWithSite(

            farm.id,

            tankId

        );


    /*
     * Find active Crop.
     */
    const crop =
        await prisma.crop.findFirst({

            where: {

                tankId: tank.id,

                status: "ACTIVE"

            }

        });


    if (!crop) {

        throw new Error(
            "No active crop found for this tank."
        );

    }


    const newQuantity =
        feedData.quantity ??
        existingFeed.quantity;


    /*
     * Check Feed availability while
     * excluding the current Feed entry.
     */
    const stock =
        await getSiteFeedAvailability(

            farm.id,

            tank.siteId,

            feedId

        );


    if (stock.allocatedFeed <= 0) {

        throw new Error(
            "No feed stock has been allocated to this site."
        );

    }


    if (
        newQuantity >
        stock.remainingFeed
    ) {

        throw new Error(
            `Insufficient feed stock. Only ${stock.remainingFeed} kg is remaining for this site.`
        );

    }


    const newCostPerKg =
        feedData.costPerKg ??
        existingFeed.costPerKg;


    const updatedFeed =
        await prisma.feedEntry.update({

            where: {

                id: feedId

            },

            data: {

                cropId:
                    crop.id,

                date:
                    feedData.date
                        ? new Date(
                            feedData.date
                        )
                        : undefined,

                feedType:
                    feedData.feedType ??
                    undefined,

                feedBrand:
                    feedData.feedBrand ??
                    undefined,

                feedSize:
                    feedData.feedSize ??
                    undefined,

                quantity:
                    newQuantity,

                costPerKg:
                    newCostPerKg,

                totalCost:
                    newQuantity *
                    newCostPerKg,

                notes:
                    feedData.notes ??
                    undefined

            }

        });


    return updatedFeed;

};


/*
 * Delete Feed
 */
export const deleteFeed = async (
    userId,
    feedId
) => {

    await getFeedById(

        userId,

        feedId

    );


    await prisma.feedEntry.delete({

        where: {

            id: feedId

        }

    });


    return {

        message:
            "Feed entry deleted successfully."

    };

};


/*
 * Get Recent Feeds
 */
export const getRecentFeeds = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    return await prisma.feedEntry.findMany({

        where: {

            crop: {

                tank: {

                    site: {

                        farmId:
                            farm.id

                    }

                }

            }

        },

        orderBy: {

            date: "desc"

        },

        take: 5

    });

};


/*
 * Get Today's Feed Summary
 */
export const getTodayFeedSummary = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        today.getDate() + 1
    );


    const feeds =
        await prisma.feedEntry.findMany({

            where: {

                crop: {

                    tank: {

                        site: {

                            farmId:
                                farm.id

                        }

                    }

                },

                date: {

                    gte: today,

                    lt: tomorrow

                }

            }

        });


    const totalFeed =
        feeds.reduce(

            (sum, item) =>
                sum + item.quantity,

            0

        );


    const totalCost =
        feeds.reduce(

            (sum, item) =>
                sum + item.totalCost,

            0

        );


    return {

        totalEntries:
            feeds.length,

        totalFeed,

        totalCost

    };

};