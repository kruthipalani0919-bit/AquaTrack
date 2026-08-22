import { z } from "zod";

export const createFeedSchema = z.object({

    tankId: z.string().min(1, "Tank is required"),

    date: z.string(),

    feedType: z.string().min(2),

    feedBrand: z.string().min(2),

    feedSize: z.string().min(1),

    quantity: z.number().positive(),

    costPerKg: z.number().positive(),

    notes: z.string().optional()

});

export const updateFeedSchema = createFeedSchema.partial();