import { z } from "zod";

export const createHarvestSchema = z.object({
    tankId: z.string().min(1, "Please select a tank"),
    harvestDate: z.string().min(1, "Harvest date is required"),
    harvestWeight: z
        .number({ invalid_type_error: "Harvest Weight must be a number" })
        .positive("Harvest Weight must be greater than 0"),
    harvestType: z
        .enum(["INTERMEDIATE", "FINAL"])
        .optional()
        .default("INTERMEDIATE"),
    shrimpCount: z.number().positive().optional().nullable(),
    production: z.number().positive().optional().nullable(),
    averageWeight: z.number().positive().optional().nullable(),
    survivalRate: z.number().min(0).max(100).optional().default(85),
    sellingPrice: z
        .number({ invalid_type_error: "Selling Price must be a number" })
        .positive("Selling Price must be greater than 0"),
    buyerName: z.string().min(1, "Buyer Name is required"),
    transportationCost: z.number().optional().nullable(),
    harvestExpense: z.number().min(0, "Harvest expense cannot be negative"),
    notes: z.string().optional().nullable(),
});

export const updateHarvestSchema =
    createHarvestSchema.partial();