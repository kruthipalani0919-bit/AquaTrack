import prisma from "../config/prisma.js";
import { getUserFarm, getUserTank } from "../utils/farm.helpers.js";

/**
 * Calculate the inclusive number of days between two dates.
 */
export const getDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (end < start) return 0;

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diffDays);
};

/**
 * Create a new Pond Lease record.
 */
export const createPondLease = async (userId, leaseData) => {
    const farm = await getUserFarm(userId);

    const tank = await getUserTank(farm.id, leaseData.tankId);

    const lease = await prisma.pondLease.create({
        data: {
            tankId: tank.id,
            totalLeaseAmount: leaseData.totalLeaseAmount,
            leaseStartDate: new Date(leaseData.leaseStartDate),
            leaseEndDate: new Date(leaseData.leaseEndDate),
            remarks: leaseData.remarks ?? null
        },
        include: {
            tank: {
                include: {
                    site: true
                }
            }
        }
    });

    const totalLeaseDays = getDaysBetween(lease.leaseStartDate, lease.leaseEndDate);
    const dailyLeaseCost = totalLeaseDays > 0 ? (lease.totalLeaseAmount / totalLeaseDays) : 0;

    return {
        ...lease,
        totalLeaseDays,
        dailyLeaseCost
    };
};

/**
 * Get all Pond Leases belonging to the logged-in user's farm.
 */
export const getPondLeases = async (userId) => {
    const farm = await getUserFarm(userId);

    const leases = await prisma.pondLease.findMany({
        where: {
            tank: {
                site: {
                    farmId: farm.id
                }
            }
        },
        include: {
            tank: {
                include: {
                    site: true
                }
            }
        },
        orderBy: {
            leaseStartDate: "desc"
        }
    });

    return leases.map((lease) => {
        const totalLeaseDays = getDaysBetween(lease.leaseStartDate, lease.leaseEndDate);
        const dailyLeaseCost = totalLeaseDays > 0 ? (lease.totalLeaseAmount / totalLeaseDays) : 0;

        return {
            ...lease,
            totalLeaseDays,
            dailyLeaseCost
        };
    });
};

/**
 * Get Pond Lease by ID with user ownership check.
 */
export const getPondLeaseById = async (userId, leaseId) => {
    const farm = await getUserFarm(userId);

    const lease = await prisma.pondLease.findFirst({
        where: {
            id: leaseId,
            tank: {
                site: {
                    farmId: farm.id
                }
            }
        },
        include: {
            tank: {
                include: {
                    site: true
                }
            }
        }
    });

    if (!lease) {
        throw new Error("Pond lease record not found.");
    }

    const totalLeaseDays = getDaysBetween(lease.leaseStartDate, lease.leaseEndDate);
    const dailyLeaseCost = totalLeaseDays > 0 ? (lease.totalLeaseAmount / totalLeaseDays) : 0;

    return {
        ...lease,
        totalLeaseDays,
        dailyLeaseCost
    };
};

/**
 * Get detailed crop-wise allocation for a specific Pond Lease.
 */
export const getLeaseCropAllocations = async (userId, leaseId) => {
    const lease = await getPondLeaseById(userId, leaseId);

    const crops = await prisma.crop.findMany({
        where: {
            tankId: lease.tankId
        },
        include: {
            harvests: {
                orderBy: {
                    harvestDate: "desc"
                },
                take: 1
            }
        },
        orderBy: {
            stockingDate: "asc"
        }
    });

    const totalLeaseDays = lease.totalLeaseDays;
    const dailyLeaseCost = lease.dailyLeaseCost;
    const today = new Date();

    const cropAllocations = crops.map((crop) => {
        const cropStartDate = new Date(crop.stockingDate);

        let cropEndDate;
        if (crop.status === "ACTIVE") {
            cropEndDate = today;
        } else {
            cropEndDate = crop.harvests?.[0]?.harvestDate
                ? new Date(crop.harvests[0].harvestDate)
                : crop.expectedHarvestDate
                    ? new Date(crop.expectedHarvestDate)
                    : new Date(crop.updatedAt);
        }

        const leaseStart = new Date(lease.leaseStartDate);
        const leaseEnd = new Date(lease.leaseEndDate);

        const cropOverlapStart = cropStartDate > leaseStart ? cropStartDate : leaseStart;
        const cropOverlapEnd = cropEndDate < leaseEnd ? cropEndDate : leaseEnd;

        let overlappingDays = 0;
        if (cropOverlapStart <= cropOverlapEnd) {
            overlappingDays = getDaysBetween(cropOverlapStart, cropOverlapEnd);
        }

        const allocatedLeaseCost = Math.round(dailyLeaseCost * overlappingDays * 100) / 100;

        return {
            cropId: crop.id,
            cropName: crop.cropName || crop.batchNumber || `Batch ${crop.seedVariety}`,
            seedVariety: crop.seedVariety,
            batchNumber: crop.batchNumber,
            stockingDate: crop.stockingDate,
            cropStatus: crop.status,
            cropEndDate: crop.status === "ACTIVE" ? today : cropEndDate,
            overlappingDays,
            allocatedLeaseCost
        };
    });

    return {
        lease,
        totalLeaseDays,
        dailyLeaseCost,
        cropAllocations
    };
};

/**
 * Update Pond Lease record.
 */
export const updatePondLease = async (userId, leaseId, leaseData) => {
    await getPondLeaseById(userId, leaseId);

    const updateData = { ...leaseData };
    if (updateData.leaseStartDate) {
        updateData.leaseStartDate = new Date(updateData.leaseStartDate);
    }
    if (updateData.leaseEndDate) {
        updateData.leaseEndDate = new Date(updateData.leaseEndDate);
    }

    const updatedLease = await prisma.pondLease.update({
        where: {
            id: leaseId
        },
        data: updateData,
        include: {
            tank: {
                include: {
                    site: true
                }
            }
        }
    });

    const totalLeaseDays = getDaysBetween(updatedLease.leaseStartDate, updatedLease.leaseEndDate);
    const dailyLeaseCost = totalLeaseDays > 0 ? (updatedLease.totalLeaseAmount / totalLeaseDays) : 0;

    return {
        ...updatedLease,
        totalLeaseDays,
        dailyLeaseCost
    };
};

/**
 * Delete Pond Lease record.
 */
export const deletePondLease = async (userId, leaseId) => {
    await getPondLeaseById(userId, leaseId);

    await prisma.pondLease.delete({
        where: {
            id: leaseId
        }
    });

    return {
        message: "Pond lease deleted successfully."
    };
};
