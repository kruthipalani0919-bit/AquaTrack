import prisma from "../config/prisma.js";

export const createFeed = async (userId, feedData) => {

    // Find the logged-in user's farm
    const farm = await prisma.farm.findFirst({
        where: {
            userId
        }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    // Verify the tank belongs to this farm
    const tank = await prisma.tank.findFirst({
        where: {
            id: feedData.tankId,
            farmId: farm.id
        }
    });

    if (!tank) {
        throw new Error("Tank not found.");
    }

    // Find active crop in the selected tank
    const crop = await prisma.crop.findFirst({
        where: {
            tankId: tank.id,
            status: "ACTIVE"
        }
    });

    if (!crop) {
        throw new Error("No active crop found for this tank.");
    }

    // Auto calculate total cost
    const totalCost = feedData.quantity * feedData.costPerKg;

    const feed = await prisma.feedEntry.create({

        data: {

            cropId: crop.id,

            date: new Date(feedData.date),

            feedType: feedData.feedType,

            feedBrand: feedData.feedBrand,

            feedSize: feedData.feedSize,

            quantity: feedData.quantity,

            costPerKg: feedData.costPerKg,

            totalCost,

            notes: feedData.notes ?? null

        }

    });

    return feed;

};

export const getFeeds = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: { userId }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const feeds = await prisma.feedEntry.findMany({

        where: {
            crop: {
                tank: {
                    farmId: farm.id
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

export const getFeedById = async (userId, feedId) => {

    const farm = await prisma.farm.findFirst({
        where: { userId }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const feed = await prisma.feedEntry.findFirst({

        where: {
            id: feedId,
            crop: {
                tank: {
                    farmId: farm.id
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
        throw new Error("Feed entry not found.");
    }

    return feed;

};

export const updateFeed = async (userId, feedId, feedData) => {

    await getFeedById(userId, feedId);

    const updatedFeed = await prisma.feedEntry.update({

        where: {
            id: feedId
        },

        data: {

            date: feedData.date
                ? new Date(feedData.date)
                : undefined,

            feedType: feedData.feedType,

            feedBrand: feedData.feedBrand,

            feedSize: feedData.feedSize,

            quantity: feedData.quantity,

            costPerKg: feedData.costPerKg,

            totalCost:
                feedData.quantity && feedData.costPerKg
                    ? feedData.quantity * feedData.costPerKg
                    : undefined,

            notes: feedData.notes

        }

    });

    return updatedFeed;

};

export const deleteFeed = async (userId, feedId) => {

    await getFeedById(userId, feedId);

    await prisma.feedEntry.delete({

        where: {
            id: feedId
        }

    });

    return {
        message: "Feed entry deleted successfully."
    };

};

export const getRecentFeeds = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: { userId }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    return await prisma.feedEntry.findMany({

        where: {
            crop: {
                tank: {
                    farmId: farm.id
                }
            }
        },

        orderBy: {
            date: "desc"
        },

        take: 5

    });

};

export const getTodayFeedSummary = async (userId) => {

    const farm = await prisma.farm.findFirst({
        where: { userId }
    });

    if (!farm) {
        throw new Error("Please create a farm first.");
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const feeds = await prisma.feedEntry.findMany({

        where: {

            crop: {
                tank: {
                    farmId: farm.id
                }
            },

            date: {
                gte: today,
                lt: tomorrow
            }

        }

    });

    const totalFeed = feeds.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalCost = feeds.reduce(
        (sum, item) => sum + item.totalCost,
        0
    );

    return {

        totalEntries: feeds.length,

        totalFeed,

        totalCost

    };

};