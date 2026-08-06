import {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    getMedicineSummary
} from "../services/medicine.service.js";

export const createMedicineController = async (req, res) => {

    try {

        const medicine = await createMedicine(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Medicine entry created successfully",

            data: medicine

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getMedicinesController = async (req, res) => {

    try {

        const medicines = await getMedicines(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Medicine entries fetched successfully",

            data: medicines

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getMedicineByIdController = async (req, res) => {

    try {

        const medicine = await getMedicineById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Medicine entry fetched successfully",

            data: medicine

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const updateMedicineController = async (req, res) => {

    try {

        const medicine = await updateMedicine(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Medicine entry updated successfully",

            data: medicine

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const deleteMedicineController = async (req, res) => {

    try {

        await deleteMedicine(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Medicine entry deleted successfully"

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const getMedicineSummaryController = async (req, res) => {

    try {

        const summary = await getMedicineSummary(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Medicine summary fetched successfully",

            data: summary

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};