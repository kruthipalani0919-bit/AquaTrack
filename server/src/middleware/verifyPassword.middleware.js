import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

/**
 * Middleware to verify current account password before completing delete operations.
 */
export const verifyPassword = async (req, res, next) => {
    try {
        const password = req.body?.password || req.headers['x-confirm-password'] || req.query?.password;

        if (!password || typeof password !== 'string' || !password.trim()) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication required."
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found."
            });
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Password verification failed. Please try again."
        });
    }
};

export default verifyPassword;
