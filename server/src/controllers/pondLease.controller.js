import {
    createPondLease,
    getPondLeases,
    getPondLeaseById,
    getLeaseCropAllocations,
    updatePondLease,
    deletePondLease
} from "../services/pondLease.service.js";

export const createPondLeaseController = async (req, res) => {
    try {
        const lease = await createPondLease(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Pond lease created successfully",
            data: lease
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getPondLeasesController = async (req, res) => {
    try {
        const leases = await getPondLeases(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Pond leases fetched successfully",
            data: leases
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getPondLeaseByIdController = async (req, res) => {
    try {
        const lease = await getPondLeaseById(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Pond lease fetched successfully",
            data: lease
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getLeaseCropAllocationsController = async (req, res) => {
    try {
        const details = await getLeaseCropAllocations(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Crop allocations fetched successfully",
            data: details
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updatePondLeaseController = async (req, res) => {
    try {
        const lease = await updatePondLease(req.user.id, req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Pond lease updated successfully",
            data: lease
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePondLeaseController = async (req, res) => {
    try {
        const result = await deletePondLease(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
