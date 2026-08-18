import { z } from "zod";

export const createFarmSchema = z.object({

    farmName: z
        .string()
        .min(3, "Farm name must be at least 3 characters"),

    ownerName: z
        .string()
        .min(3, "Owner name must be at least 3 characters")

});

export const updateFarmSchema = createFarmSchema.partial();