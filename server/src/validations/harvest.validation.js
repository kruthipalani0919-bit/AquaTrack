import { z } from "zod";

export const createHarvestSchema = z.object({
    tankId: z.string().min(1),
    harvestDate: z.string(),
    production: z.number().positive().optional().nullable(),
    shrimpCount: z.number().positive(),
    averageWeight: z.number().positive().optional().nullable(),
    survivalRate: z.number().min(0).max(100).optional().default(85),
    sellingPrice: z.number().positive(),
    buyerName: z.string().min(1),
    transportationCost: z.number().optional().nullable(),
    harvestExpense: z.number().min(0),
    notes: z.string().optional().nullable(),
});

export const updateHarvestSchema =
    createHarvestSchema.partial();