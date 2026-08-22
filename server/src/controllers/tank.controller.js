import {
    createTank,
    getTanks,
    getTankById,
    updateTank,
    deleteTank
} from "../services/tank.service.js";


/*
 * Create Tank
 */
export const createTankController = async (req, res) => {

    try {

        const tank = await createTank(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Tank created successfully",

            data: tank

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get All Tanks
 */
export const getTanksController = async (req, res) => {

    try {

        const tanks = await getTanks(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Tanks fetched successfully",

            data: tanks

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Get Tank By ID
 */
export const getTankByIdController = async (req, res) => {

    try {

        const tank = await getTankById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Tank fetched successfully",

            data: tank

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Update Tank
 */
export const updateTankController = async (req, res) => {

    try {

        const tank = await updateTank(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Tank updated successfully",

            data: tank

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


/*
 * Delete Tank
 */
export const deleteTankController = async (req, res) => {

    try {

        const result = await deleteTank(
            req.user.id,
            req.params.id
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