import { z } from "zod";

export const createMedicineSchema = z.object({

    tankId: z.string().min(1, "Tank is required"),

    medicineName: z.string().min(2),

    purpose: z.string().min(2),

    dosage: z.string().min(1),

    quantity: z.number().positive(),

    cost: z.number().positive(),

    date: z.string(),

    notes: z.string().optional()

});

export const updateMedicineSchema =
    createMedicineSchema.partial();