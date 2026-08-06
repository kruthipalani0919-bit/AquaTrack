import { z } from "zod";

export const createHarvestSchema = z.object({

    tankId: z.string().min(1),

    harvestDate: z.string(),

    production: z.number().positive(),

    averageWeight: z.number().positive(),

    survivalRate: z.number().min(0).max(100),

    sellingPrice: z.number().positive(),

    buyerName: z.string().min(2),

    transportationCost: z.number().min(0),

    harvestExpense: z.number().min(0)

});

export const updateHarvestSchema =
    createHarvestSchema.partial();