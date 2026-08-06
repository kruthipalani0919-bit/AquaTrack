import {
    createHarvest,
    getHarvests,
    getHarvestById,
    deleteHarvest,
    getHarvestSummary
} from "../services/harvest.service.js";

export const createHarvestController = async (req, res) => {

    try {

        const harvest = await createHarvest(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Harvest created successfully",

            data: harvest

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getHarvestsController = async (req, res) => {

    try {

        const harvests = await getHarvests(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "Harvests fetched successfully",

            data: harvests

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getHarvestByIdController = async (req, res) => {

    try {

        const harvest = await getHarvestById(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Harvest fetched successfully",

            data: harvest

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const deleteHarvestController = async (req, res) => {

    try {

        await deleteHarvest(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Harvest deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getHarvestSummaryController = async (req, res) => {

    try {

        const summary = await getHarvestSummary(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "Harvest summary fetched successfully",

            data: summary

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};