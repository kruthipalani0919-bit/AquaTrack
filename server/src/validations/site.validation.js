import { z } from "zod";

export const createSiteSchema = z.object({

    siteName: z
        .string()
        .min(2, "Site name must be at least 2 characters"),

    location: z
        .string()
        .min(2, "Location is required"),

    district: z
        .string()
        .min(2, "District is required"),

    state: z
        .string()
        .min(2, "State is required"),

    gpsLocation: z
        .string()
        .optional(),

    remarks: z
        .string()
        .optional()

});

export const updateSiteSchema = createSiteSchema.partial();