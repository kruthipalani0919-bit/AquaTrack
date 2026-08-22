import { createFarm, getFarm, updateFarm, deleteFarm } from "../services/farm.service.js";

export const createFarmController = async (req, res) => {

    try {

        const farm = await createFarm(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Farm created successfully",

            data: farm

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getFarmController = async (req, res) => {

    try {

        const farm = await getFarm(req.user.id);

        return res.status(200).json({

            success: true,

            message: "Farm fetched successfully",

            data: farm

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const updateFarmController = async (req, res) => {

    try {

        const farm = await updateFarm(

            req.user.id,

            req.params.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Farm updated successfully",

            data: farm

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const deleteFarmController = async (req, res) => {

    try {

        await deleteFarm(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Farm deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};