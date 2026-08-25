import prisma from "../config/prisma.js";

import {
    getUserFarm,
    getUserSite
} from "../utils/farm.helpers.js";


/*
 * Calculate the quantity already used
 * for a particular stocking category
 * at a particular Site.
 *
 * FEED:
 *    Sum FeedEntry.quantity
 *
 * MEDICINE:
 *    Sum Medicine.quantity
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
 * Calculate total Farm-level usage
 * for a Stocking category.
 */
const getFarmStockUsage = async (
    farmId,
    category
) => {

    if (category === "FEED") {

        const result =
            await prisma.feedEntry.aggregate({

                where: {

                    crop: {

                        tank: {

                            site: {

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
 * Create Stock
 *
 * Stock is created at Farm level.
 */
export const createStocking = async (
    userId,
    stockingData
) => {

    const farm = await getUserFarm(userId);

    const stocking =
        await prisma.stocking.create({

            data: {

                category:
                    stockingData.category,

                totalQuantity:
                    stockingData.totalQuantity,

                unit:
                    stockingData.unit ?? "kg",

                farmId:
                    farm.id

            }

        });


    return stocking;

};


/*
 * Get all Stock
 *
 * Returns Farm-level stock overview
 * including:
 *
 * Total
 * Allocated
 * Used
 * Remaining
 *
 * and Site-level:
 *
 * Allocated
 * Used
 * Remaining
 */
export const getStockings = async (
    userId
) => {

    const farm =
        await getUserFarm(userId);


    const stockings =
        await prisma.stocking.findMany({

            where: {

                farmId:
                    farm.id

            },

            include: {

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

        /*
         * Farm-level used quantity.
         */
        const totalUsed =
            await getFarmStockUsage(

                farm.id,

                stocking.category

            );


        /*
         * Total quantity allocated
         * across all Sites.
         */
        const totalAllocated =
            stocking.allocations.reduce(

                (sum, allocation) =>

                    sum +
                    allocation.allocatedQuantity,

                0

            );


        /*
         * Remaining Farm stock.
         *
         * This is calculated from the
         * original stock minus actual usage.
         */
        const totalRemaining =
            Math.max(

                stocking.totalQuantity -
                totalUsed,

                0

            );


        /*
         * Group allocations by Site.
         *
         * This prevents duplicate Site
         * information if the same Site
         * received stock multiple times.
         */
        const siteMap = new Map();


        for (
            const allocation
            of stocking.allocations
        ) {

            const existing =
                siteMap.get(
                    allocation.siteId
                );


            if (existing) {

                existing.allocatedQuantity +=
                    allocation.allocatedQuantity;

            } else {

                siteMap.set(

                    allocation.siteId,

                    {

                        allocationId:
                            allocation.id,

                        site:
                            allocation.site,

                        allocatedQuantity:
                            allocation.allocatedQuantity

                    }

                );

            }

        }


        /*
         * Build Site-level stock overview.
         */
        const siteStock =
            [];


        for (
            const [
                siteId,
                siteData
            ]
            of siteMap
        ) {

            const usedQuantity =
                await getSiteStockUsage(

                    farm.id,

                    siteId,

                    stocking.category

                );


            const remainingQuantity =
                Math.max(

                    siteData.allocatedQuantity -
                    usedQuantity,

                    0

                );


            siteStock.push({

                allocationId:
                    siteData.allocationId,

                site:
                    siteData.site,

                allocatedQuantity:
                    siteData.allocatedQuantity,

                usedQuantity,

                remainingQuantity,

                unit:
                    stocking.unit

            });

        }


        result.push({

            id:
                stocking.id,

            category:
                stocking.category,

            totalQuantity:
                stocking.totalQuantity,

            unit:
                stocking.unit,

            farmId:
                stocking.farmId,

            createdAt:
                stocking.createdAt,

            updatedAt:
                stocking.updatedAt,

            totalAllocated,

            totalUsed,

            totalRemaining,

            /*
             * Quantity which has not yet
             * been allocated to any Site.
             */
            unallocatedQuantity:
                Math.max(

                    stocking.totalQuantity -
                    totalAllocated,

                    0

                ),

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

                id:
                    stockingId,

                farmId:
                    farm.id

            },

            include: {

                allocations: {

                    include: {

                        site: true

                    }

                }

            }

        });


    if (!stocking) {

        throw new Error(
            "Stocking record not found."
        );

    }


    /*
     * Farm-level usage.
     */
    const totalUsed =
        await getFarmStockUsage(

            farm.id,

            stocking.category

        );


    /*
     * Total allocated.
     */
    const totalAllocated =
        stocking.allocations.reduce(

            (sum, allocation) =>

                sum +
                allocation.allocatedQuantity,

            0

        );


    /*
     * Farm-level remaining.
     */
    const totalRemaining =
        Math.max(

            stocking.totalQuantity -
            totalUsed,

            0

        );


    /*
     * Group allocations by Site.
     */
    const siteMap =
        new Map();


    for (
        const allocation
        of stocking.allocations
    ) {

        const existing =
            siteMap.get(
                allocation.siteId
            );


        if (existing) {

            existing.allocatedQuantity +=
                allocation.allocatedQuantity;

        } else {

            siteMap.set(

                allocation.siteId,

                {

                    site:
                        allocation.site,

                    allocatedQuantity:
                        allocation.allocatedQuantity

                }

            );

        }

    }


    const siteStock =
        [];


    for (
        const [
            siteId,
            siteData
        ]
        of siteMap
    ) {

        const usedQuantity =
            await getSiteStockUsage(

                farm.id,

                siteId,

                stocking.category

            );


        const remainingQuantity =
            Math.max(

                siteData.allocatedQuantity -
                usedQuantity,

                0

            );


        siteStock.push({

            site:
                siteData.site,

            allocatedQuantity:
                siteData.allocatedQuantity,

            usedQuantity,

            remainingQuantity,

            unit:
                stocking.unit

        });

    }


    return {

        id:
            stocking.id,

        category:
            stocking.category,

        totalQuantity:
            stocking.totalQuantity,

        unit:
            stocking.unit,

        farmId:
            stocking.farmId,

        createdAt:
            stocking.createdAt,

        updatedAt:
            stocking.updatedAt,

        totalAllocated,

        totalUsed,

        totalRemaining,

        unallocatedQuantity:
            Math.max(

                stocking.totalQuantity -
                totalAllocated,

                0

            ),

        siteStock

    };

};


/*
 * Allocate Stock to Site
 */
export const allocateStockToSite = async (
    userId,
    stockingId,
    allocationData
) => {

    const farm =
        await getUserFarm(userId);


    const stocking =
        await prisma.stocking.findFirst({

            where: {

                id:
                    stockingId,

                farmId:
                    farm.id

            }

        });


    if (!stocking) {

        throw new Error(
            "Stocking record not found."
        );

    }


    const site =
        await getUserSite(

            farm.id,

            allocationData.siteId

        );


    /*
     * Calculate existing allocation.
     */
    const existingAllocations =
        await prisma.siteStockAllocation.aggregate({

            where: {

                stockingId:
                    stocking.id

            },

            _sum: {

                allocatedQuantity:
                    true

            }

        });


    const alreadyAllocated =
        existingAllocations
            ._sum
            .allocatedQuantity ?? 0;


    const newTotalAllocation =
        alreadyAllocated +
        allocationData.allocatedQuantity;


    /*
     * Do not allow allocation
     * greater than farm stock.
     */
    if (
        newTotalAllocation >
        stocking.totalQuantity
    ) {

        throw new Error(
            "Allocation quantity cannot exceed available stock."
        );

    }


    const allocation =
        await prisma.siteStockAllocation.create({

            data: {

                allocatedQuantity:
                    allocationData.allocatedQuantity,

                unit:
                    allocationData.unit ??
                    stocking.unit,

                stockingId:
                    stocking.id,

                siteId:
                    site.id

            },

            include: {

                site: true,

                stocking: true

            }

        });


    return allocation;

};


/*
 * Get Site Stock Allocations
 */
export const getSiteStockAllocations = async (
    userId,
    siteId
) => {

    const farm =
        await getUserFarm(userId);


    const site =
        await getUserSite(

            farm.id,

            siteId

        );


    const allocations =
        await prisma.siteStockAllocation.findMany({

            where: {

                siteId:
                    site.id,

                stocking: {

                    farmId:
                        farm.id

                }

            },

            include: {

                stocking:
                    true,

                site:
                    true

            },

            orderBy: {

                createdAt:
                    "desc"

            }

        });


    /*
     * Add Used and Remaining
     * information to each category.
     */
    const result = [];


    for (
        const allocation
        of allocations
    ) {

        const usedQuantity =
            await getSiteStockUsage(

                farm.id,

                site.id,

                allocation.stocking.category

            );


        /*
         * Total allocation of the same
         * category to this Site.
         */
        const categoryAllocation =
            allocations
                .filter(

                    item =>
                        item.stocking.category ===
                        allocation.stocking.category

                )
                .reduce(

                    (sum, item) =>

                        sum +
                        item.allocatedQuantity,

                    0

                );


        const remainingQuantity =
            Math.max(

                categoryAllocation -
                usedQuantity,

                0

            );


        result.push({

            ...allocation,

            usedQuantity,

            remainingQuantity

        });

    }


    return result;

};

/*
 * Update Farm Stock (Total Quantity)
 */
export const updateStocking = async (userId, stockingId, stockingData) => {
    const farm = await getUserFarm(userId);

    const stocking = await prisma.stocking.findFirst({
        where: {
            id: stockingId,
            farmId: farm.id
        },
        include: {
            allocations: true
        }
    });

    if (!stocking) {
        throw new Error("Stocking record not found.");
    }

    const totalAllocated = stocking.allocations.reduce(
        (sum, item) => sum + item.allocatedQuantity,
        0
    );

    const newTotalQuantity = parseFloat(stockingData.totalQuantity);
    if (isNaN(newTotalQuantity) || newTotalQuantity <= 0) {
        throw new Error("Valid positive total quantity is required.");
    }

    if (newTotalQuantity < totalAllocated) {
        throw new Error(`Total stock quantity cannot be less than already allocated quantity (${totalAllocated} ${stocking.unit}).`);
    }

    const updated = await prisma.stocking.update({
        where: { id: stocking.id },
        data: {
            totalQuantity: newTotalQuantity,
            unit: stockingData.unit ? stockingData.unit.trim() : stocking.unit
        }
    });

    return updated;
};

/*
 * Delete Farm Stock
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
 * Update Site Stock Allocation
 */
export const updateSiteStockAllocation = async (userId, allocationId, allocationData) => {
    const farm = await getUserFarm(userId);

    const allocation = await prisma.siteStockAllocation.findFirst({
        where: { id: allocationId },
        include: {
            stocking: {
                include: { allocations: true }
            }
        }
    });

    if (!allocation || allocation.stocking.farmId !== farm.id) {
        throw new Error("Site stock allocation record not found.");
    }

    const newAllocatedQuantity = parseFloat(allocationData.allocatedQuantity);
    if (isNaN(newAllocatedQuantity) || newAllocatedQuantity <= 0) {
        throw new Error("Valid positive allocation quantity is required.");
    }

    const otherAllocationsSum = allocation.stocking.allocations
        .filter(item => item.id !== allocation.id)
        .reduce((sum, item) => sum + item.allocatedQuantity, 0);

    if (otherAllocationsSum + newAllocatedQuantity > allocation.stocking.totalQuantity) {
        throw new Error("Allocation quantity cannot exceed available farm stock.");
    }

    const updated = await prisma.siteStockAllocation.update({
        where: { id: allocation.id },
        data: {
            allocatedQuantity: newAllocatedQuantity
        },
        include: {
            site: true,
            stocking: true
        }
    });

    return updated;
};

/*
 * Delete Site Stock Allocation
 */
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