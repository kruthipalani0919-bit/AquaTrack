import { z } from "zod";

export const createHarvestSchema = z.object({

    tankId: z.string().min(1),

    harvestDate: z.string(),

    production: z.number().positive(),

    /*
     * User enters shrimp count.
     *
     * Example:
     * 60 count -> ABW = 1000 / 60
     * -> approximately 16.67 grams
     */
    shrimpCount: z.number().positive(),

    survivalRate: z.number().min(0).max(100),

    sellingPrice: z.number().positive(),

    buyerName: z.string().min(2),

    harvestExpense: z.number().min(0)

});


export const updateHarvestSchema =
    createHarvestSchema.partial();