import { getDashboard } from "../services/dashboard.service.js";

export const getDashboardController = async (req, res) => {

    try {

        const dashboard = await getDashboard(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            message: "Dashboard fetched successfully",

            data: dashboard

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};