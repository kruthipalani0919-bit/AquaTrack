import { z } from "zod";

/*
 * Create Site-Level Stock
 */
export const createStockingSchema = z.object({

    siteId: z
        .string()
        .min(1, "Site is required"),

    category: z.enum(
        ["FEED", "MEDICINE", "SEED"],
        {
            errorMap: () => ({
                message:
                    "Category must be FEED, MEDICINE or SEED"
            })
        }
    ),

    totalQuantity: z
        .number()
        .positive(
            "Total quantity must be greater than 0"
        ),

    unit: z
        .string()
        .min(1, "Unit is required")
        .optional(),

    costPerKg: z
        .number()
        .positive(
            "Cost per kg must be greater than 0"
        )
        .optional()

}).superRefine((data, ctx) => {

    /*
     * Seed must have cost per kg.
     */
    if (
        data.category === "SEED" &&
        data.costPerKg === undefined
    ) {

        ctx.addIssue({

            code: z.ZodIssueCode.custom,

            path: ["costPerKg"],

            message:
                "Cost per kg is required for SEED"

        });

    }


    /*
     * Feed and Medicine should not
     * receive a cost per kg through
     * the Stocking page.
     */
    if (
        data.category !== "SEED" &&
        data.costPerKg !== undefined
    ) {

        ctx.addIssue({

            code: z.ZodIssueCode.custom,

            path: ["costPerKg"],

            message:
                "Cost per kg is only applicable for SEED"

        });

    }

});


/*
 * Allocate Stock to Site (Legacy)
 */
export const allocateStockSchema = z.object({

    siteId: z
        .string()
        .min(1, "Site is required"),

    allocatedQuantity: z
        .number()
        .positive(
            "Allocated quantity must be greater than 0"
        ),

    unit: z
        .string()
        .min(1, "Unit is required")
        .optional()

});