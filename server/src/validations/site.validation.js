import { z } from "zod";

export const createSiteSchema = z.object({

    siteName: z
        .string()
        .min(2, "Site name must be at least 2 characters"),

    location: z
        .string()
        .min(2, "Location is required"),

    area: z
        .number()
        .positive("Area must be greater than 0"),

    gpsLocation: z
        .string()
        .optional(),

    remarks: z
        .string()
        .optional()

});

export const updateSiteSchema = createSiteSchema.partial();