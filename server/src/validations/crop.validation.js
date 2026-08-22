import { z } from "zod";


/*
 * Create Crop
 *
 * Only the fields required by the
 * current Crop registration UI are accepted.
 */
export const createCropSchema = z.object({

    tankId: z
        .string()
        .min(1, "Tank is required"),

    stockingDate: z
        .string()
        .min(1, "Stocking date is required"),

    seedVariety: z
        .string()
        .min(2, "Seed variety is required"),

    batchNumber: z
        .string()
        .min(1, "Batch number is required"),

    notes: z
        .string()
        .optional()

});


/*
 * Update Crop
 *
 * All Crop creation fields become optional
 * during update.
 */
export const updateCropSchema =
    createCropSchema.partial();