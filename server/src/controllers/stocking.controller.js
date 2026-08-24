import {
    createStocking,
    getStockings,
    getStockingById,
    updateStocking,
    deleteStocking,
    allocateStockToSite,
    getSiteStockAllocations
} from "../services/stocking.service.js";



/*
 * Create Stocking
 */
export const createStockingController = async (
    req,
    res
) => {

    try {

        const stocking = await createStocking(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Stocking created successfully",

            data: stocking

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get all Stocking records
 */
export const getStockingsController = async (
    req,
    res
) => {

    try {

        const stockings = await getStockings(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "Stocking records fetched successfully",

            data: stockings

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get Stocking by ID
 */
export const getStockingByIdController = async (
    req,
    res
) => {

    try {

        const stocking = await getStockingById(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Stocking record fetched successfully",

            data: stocking

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Allocate Stock to Site
 */
export const allocateStockToSiteController = async (
    req,
    res
) => {

    try {

        const allocation = await allocateStockToSite(

            req.user.id,

            req.params.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Stock allocated to site successfully",

            data: allocation

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get Stock Allocations for a Site
 */
export const getSiteStockAllocationsController = async (
    req,
    res
) => {

    try {

        const allocations =
            await getSiteStockAllocations(

                req.user.id,

                req.params.siteId

            );

        return res.status(200).json({

            success: true,

            message: "Site stock allocations fetched successfully",

            data: allocations

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Update Stocking record
 */
export const updateStockingController = async (
    req,
    res
) => {

    try {

        const stocking = await updateStocking(

            req.user.id,

            req.params.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Stocking record updated successfully",

            data: stocking

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Delete Stocking record
 */
export const deleteStockingController = async (
    req,
    res
) => {

    try {

        const result = await deleteStocking(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: result.message || "Stocking record deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};