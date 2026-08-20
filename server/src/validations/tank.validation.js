import { z } from "zod";

export const createTankSchema = z.object({

    siteId: z
        .string()
        .min(1, "Site is required"),

    tankName: z
        .string()
        .min(2, "Tank name must be at least 2 characters"),

    area: z
        .number()
        .positive("Area must be greater than 0"),

    depth: z
        .number()
        .positive("Depth must be greater than 0"),

    waterSource: z
        .string()
        .min(2, "Water source is required"),

    gpsLocation: z
        .string()
        .optional(),

    remarks: z
        .string()
        .optional(),

    hatcheryName: z
        .string()
        .nullable()
        .optional(),

    hatcheryUnit: z
        .string()
        .nullable()
        .optional()

});

export const updateTankSchema = z.object({

    siteId: z
        .string()
        .min(1, "Site is required")
        .optional(),

    tankName: z
        .string()
        .min(2, "Tank name must be at least 2 characters")
        .optional(),

    area: z
        .number()
        .positive("Area must be greater than 0")
        .optional(),

    depth: z
        .number()
        .positive("Depth must be greater than 0")
        .optional(),

    waterSource: z
        .string()
        .min(2, "Water source is required")
        .optional(),

    gpsLocation: z
        .string()
        .optional(),

    remarks: z
        .string()
        .optional(),

    hatcheryName: z
        .string()
        .nullable()
        .optional(),

    hatcheryUnit: z
        .string()
        .nullable()
        .optional()

});