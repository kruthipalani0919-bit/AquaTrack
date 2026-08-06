import { z } from "zod";

export const createTankSchema = z.object({

    tankName: z.string().min(2),

    area: z.number().positive(),

    depth: z.number().positive(),

    waterSource: z.string().min(2),

    remarks: z.string().optional()

});

export const updateTankSchema = createTankSchema.partial();