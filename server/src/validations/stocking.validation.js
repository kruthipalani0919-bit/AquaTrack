import { z } from "zod";


/*
 * Create Farm Stock
 */
export const createStockingSchema = z.object({

    category: z.enum(
        ["FEED", "MEDICINE"],
        {
            errorMap: () => ({
                message: "Category must be FEED or MEDICINE"
            })
        }
    ),

    totalQuantity: z
        .number()
        .positive("Total quantity must be greater than 0"),

    unit: z
        .string()
        .min(1, "Unit is required")
        .optional()

});


/*
 * Allocate Stock to Site
 */
export const allocateStockSchema = z.object({

    siteId: z
        .string()
        .min(1, "Site is required"),

    allocatedQuantity: z
        .number()
        .positive("Allocated quantity must be greater than 0"),

    unit: z
        .string()
        .min(1, "Unit is required")
        .optional()

});