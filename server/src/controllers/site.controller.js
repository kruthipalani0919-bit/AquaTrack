import {
    createSite,
    getSites,
    getSiteById,
    updateSite,
    deleteSite
} from "../services/site.service.js";


/*
 * Create Site
 */
export const createSiteController = async (req, res) => {

    try {

        const site = await createSite(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Site created successfully",

            data: site

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get all Sites
 */
export const getSitesController = async (req, res) => {

    try {

        const sites = await getSites(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Sites fetched successfully",

            data: sites

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get Site by ID
 */
export const getSiteByIdController = async (req, res) => {

    try {

        const site = await getSiteById(

            req.user.id,

            req.params.siteId

        );

        return res.status(200).json({

            success: true,

            message: "Site fetched successfully",

            data: site

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Update Site
 */
export const updateSiteController = async (req, res) => {

    try {

        const site = await updateSite(

            req.user.id,

            req.params.siteId,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Site updated successfully",

            data: site

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Delete Site
 */
export const deleteSiteController = async (req, res) => {

    try {

        const result = await deleteSite(

            req.user.id,

            req.params.siteId

        );

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