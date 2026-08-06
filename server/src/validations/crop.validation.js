import { z } from "zod";

export const createCropSchema = z.object({

    tankId: z.string().min(1),

    cropName: z.string().min(2),

    seedVariety: z.string().min(2),

    plCount: z.number().int().positive(),

    stockingDate: z.string(),

    expectedHarvestDate: z.string(),

    cropDuration: z.number().positive(),

    expectedProduction: z.number().positive(),

    expectedSellingPrice: z.number().positive(),

    notes: z.string().optional()

});

export const updateCropSchema = createCropSchema.partial();