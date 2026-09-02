import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserSite
} from "../utils/farm.helpers.js";


/*
 * Calculate quantity already used
 * for a stocking category at a Site.
 */
const getSiteStockUsage = async (
    farmId,
    siteId,
    category
) => {

    if (category === "FEED") {

        const result =
            await prisma.feedEntry.aggregate({

                where: {

                    crop: {

                        tank: {

                            site: {

                                id: siteId,

                                farmId

                            }

                        }

                    }

                },

                _sum: {

                    quantity: true

                }

            });

        return result._sum.quantity ?? 0;

    }


    if (category === "MEDICINE") {

        const result =
            await prisma.medicine.aggregate({

                where: {

                    tank: {

                        site: {

                            id: siteId,

                            farmId

                        }

                    }

                },

                _sum: {

                    quantity: true

                }

            });

        return result._sum.quantity ?? 0;

    }


    return 0;

};


/*
 * Create Direct Site Stock
 */
export const createStocking = async (
    userId,
    stockingData
) => {

    const farm = await getUserFarm(userId);

    const site = await getUserSite(
        farm.id,
        stockingData.siteId
    );

    const stocking =
        await prisma.stocking.create({

            data: {

                category:
                    stockingData.category,

                totalQuantity:
                    stockingData.totalQuantity,

                unit:
                    stockingData.unit ?? (stockingData.category === "MEDICINE" ? "L" : "kg"),

                costPerKg:
                    stockingData.costPerKg ?? null,

                siteId:
                    site.id,

                farmId:
                    farm.id,

                ...(stockingData.stockingDate ? { createdAt: new Date(stockingData.stockingDate) } : {})

            },

            include: {

                site: true

            }

        });


    return stocking;

};


/*
 * Get all Stock & Site-Wise Inventory
 */
export const getStockings = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    /*
     * Fetch user's Sites
     */
    const sites =
        await prisma.site.findMany({

            where: {

                farmId: farm.id

            },

            orderBy: {

                siteName: "asc"

            }

        });


    /*
     * Fetch all Stocking records for the Farm
     */
    const stockings =
        await prisma.stocking.findMany({

            where: {

                farmId: farm.id

            },

            include: {

                site: true,

                allocations: {

                    include: {

                        site: true

                    }

                }

            },

            orderBy: {

                createdAt: "desc"

            }

        });


    const result = [];


    for (const stocking of stockings) {

        const targetSiteId = stocking.siteId || (stocking.allocations.length > 0 ? stocking.allocations[0].siteId : null);

        const totalUsed = targetSiteId
            ? await getSiteStockUsage(farm.id, targetSiteId, stocking.category)
            : 0;

        const totalAllocated = stocking.allocations.reduce(
            (sum, allocation) => sum + allocation.allocatedQuantity,
            0
        );

        const totalRemaining = Math.max(
            stocking.totalQuantity - totalUsed,
            0
        );

        const siteStock = [];

        if (stocking.site) {

            const usedQuantity = await getSiteStockUsage(farm.id, stocking.site.id, stocking.category);

            siteStock.push({

                allocationId: stocking.id,

                site: stocking.site,

                allocatedQuantity: stocking.totalQuantity,

                usedQuantity,

                remainingQuantity: Math.max(stocking.totalQuantity - usedQuantity, 0),

                unit: stocking.unit

            });

        } else if (stocking.allocations.length > 0) {

            for (const allocation of stocking.allocations) {

                const usedQuantity = await getSiteStockUsage(farm.id, allocation.siteId, stocking.category);

                siteStock.push({

                    allocationId: allocation.id,

                    site: allocation.site,

                    allocatedQuantity: allocation.allocatedQuantity,

                    usedQuantity,

                    remainingQuantity: Math.max(allocation.allocatedQuantity - usedQuantity, 0),

                    unit: stocking.unit

                });

            }

        }


        result.push({

            id: stocking.id,

            category: stocking.category,

            totalQuantity: stocking.totalQuantity,

            unit: stocking.unit,

            costPerKg: stocking.costPerKg,

            siteId: stocking.siteId,

            site: stocking.site,

            farmId: stocking.farmId,

            createdAt: stocking.createdAt,

            stockingDate: stocking.createdAt,

            updatedAt: stocking.updatedAt,

            totalAllocated: stocking.siteId ? stocking.totalQuantity : totalAllocated,

            totalUsed,

            totalRemaining,

            unallocatedQuantity: stocking.siteId ? 0 : Math.max(stocking.totalQuantity - totalAllocated, 0),

            siteStock

        });

    }


    return result;

};


/*
 * Get Stock by ID
 */
export const getStockingById = async (
    userId,
    stockingId
) => {

    const farm =
        await getUserFarm(userId);


    const stocking =
        await prisma.stocking.findFirst({

            where: {

                id: stockingId,

                farmId: farm.id

            },

            include: {

                site: true,

                allocations: {

                    include: {

                        site: true

                    }

                }

            }

        });


    if (!stocking) {

        throw new Error("Stocking record not found.");

    }


    const targetSiteId = stocking.siteId || (stocking.allocations.length > 0 ? stocking.allocations[0].siteId : null);

    const totalUsed = targetSiteId
        ? await getSiteStockUsage(farm.id, targetSiteId, stocking.category)
        : 0;

    const totalAllocated = stocking.allocations.reduce(
        (sum, allocation) => sum + allocation.allocatedQuantity,
        0
    );

    const totalRemaining = Math.max(stocking.totalQuantity - totalUsed, 0);

    return {

        ...stocking,

        totalAllocated: stocking.siteId ? stocking.totalQuantity : totalAllocated,

        totalUsed,

        totalRemaining,

        unallocatedQuantity: stocking.siteId ? 0 : Math.max(stocking.totalQuantity - totalAllocated, 0)

    };

};


/*
 * Update Stock Quantity
 */
export const updateStocking = async (userId, stockingId, stockingData) => {

    const farm = await getUserFarm(userId);


    const stocking = await prisma.stocking.findFirst({

        where: {

            id: stockingId,

            farmId: farm.id

        }

    });


    if (!stocking) {

        throw new Error("Stocking record not found.");

    }


    const newTotalQuantity = parseFloat(stockingData.totalQuantity);

    if (isNaN(newTotalQuantity) || newTotalQuantity <= 0) {

        throw new Error("Valid positive total quantity is required.");

    }


    const updated = await prisma.stocking.update({

        where: { id: stocking.id },

        data: {

            ...(stockingData.siteId ? { siteId: stockingData.siteId } : {}),

            totalQuantity: newTotalQuantity,

            unit: stockingData.unit ? stockingData.unit.trim() : stocking.unit,

            ...(stockingData.costPerKg !== undefined ? { costPerKg: stockingData.costPerKg } : {}),

            ...(stockingData.stockingDate ? { createdAt: new Date(stockingData.stockingDate) } : {})

        },

        include: {

            site: true

        }

    });


    return updated;

};


/*
 * Delete Stock
 */
export const deleteStocking = async (userId, stockingId) => {

    const farm = await getUserFarm(userId);


    const stocking = await prisma.stocking.findFirst({

        where: {

            id: stockingId,

            farmId: farm.id

        }

    });


    if (!stocking) {

        throw new Error("Stocking record not found.");

    }


    await prisma.stocking.delete({

        where: { id: stocking.id }

    });


    return { message: "Stock record deleted successfully." };

};


/*
 * Legacy Allocation endpoints kept for 100% backward safety
 */
export const allocateStockToSite = async (userId, stockingId, allocationData) => {

    const farm = await getUserFarm(userId);


    const stocking = await prisma.stocking.findFirst({

        where: { id: stockingId, farmId: farm.id }

    });


    if (!stocking) {

        throw new Error("Stocking record not found.");

    }


    const site = await getUserSite(farm.id, allocationData.siteId);


    const allocation = await prisma.siteStockAllocation.create({

        data: {

            allocatedQuantity: allocationData.allocatedQuantity,

            unit: allocationData.unit ?? stocking.unit,

            stockingId: stocking.id,

            siteId: site.id

        },

        include: {

            site: true,

            stocking: true

        }

    });


    return allocation;

};


export const getSiteStockAllocations = async (userId, siteId) => {

    const farm = await getUserFarm(userId);


    const site = await getUserSite(farm.id, siteId);


    const allocations = await prisma.siteStockAllocation.findMany({

        where: {

            siteId: site.id,

            stocking: { farmId: farm.id }

        },

        include: {

            stocking: true,

            site: true

        }

    });


    return allocations;

};


export const updateSiteStockAllocation = async (userId, allocationId, allocationData) => {

    const farm = await getUserFarm(userId);


    const allocation = await prisma.siteStockAllocation.findFirst({

        where: { id: allocationId },

        include: { stocking: true }

    });


    if (!allocation || allocation.stocking.farmId !== farm.id) {

        throw new Error("Site stock allocation record not found.");

    }


    const updated = await prisma.siteStockAllocation.update({

        where: { id: allocation.id },

        data: {

            allocatedQuantity: parseFloat(allocationData.allocatedQuantity)

        },

        include: {

            site: true,

            stocking: true

        }

    });


    return updated;

};


export const deleteSiteStockAllocation = async (userId, allocationId) => {

    const farm = await getUserFarm(userId);


    const allocation = await prisma.siteStockAllocation.findFirst({

        where: { id: allocationId },

        include: { stocking: true }

    });


    if (!allocation || allocation.stocking.farmId !== farm.id) {

        throw new Error("Site stock allocation record not found.");

    }


    await prisma.siteStockAllocation.delete({

        where: { id: allocation.id }

    });


    return { message: "Site stock allocation deleted successfully." };

};