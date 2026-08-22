import {
    createCrop,
    getCrops,
    getActiveCrops,
    getCropById,
    updateCrop,
    completeCrop,
    deleteCrop
} from "../services/crop.service.js";

export const createCropController = async (req, res) => {

    try {

        const crop = await createCrop(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Crop created successfully",

            data: crop

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getCropsController = async (req, res) => {

    try {

        const crops = await getCrops(req.user.id);

        return res.status(200).json({

            success: true,

            message: "Crops fetched successfully",

            data: crops

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getActiveCropsController = async (req, res) => {

    try {

        const crops = await getActiveCrops(req.user.id);

        return res.status(200).json({

            success: true,

            message: "Active crops fetched successfully",

            data: crops

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getCropByIdController = async (req, res) => {

    try {

        const crop = await getCropById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Crop fetched successfully",

            data: crop

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const updateCropController = async (req, res) => {

    try {

        const crop = await updateCrop(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Crop updated successfully",

            data: crop

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const completeCropController = async (req, res) => {

    try {

        const crop = await completeCrop(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Crop completed successfully",

            data: crop

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const deleteCropController = async (req, res) => {

    try {

        await deleteCrop(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Crop deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};