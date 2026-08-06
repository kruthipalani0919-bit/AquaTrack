import { z } from "zod";

export const createFarmSchema = z.object({

    farmName: z.string().min(3),

    ownerName: z.string().min(3),

    location: z.string().min(2),

    district: z.string().min(2),

    state: z.string().min(2),

    totalAcres: z.number().positive()

});

export const updateFarmSchema = createFarmSchema.partial();
