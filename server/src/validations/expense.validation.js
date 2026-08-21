import { z } from "zod";

export const expenseCategories = [
    "Pond Preparation",
    "Seed Cost",
    "Electricity",
    "Generator & Diesel",
    "Labour",
    "Maintenance",
    "Salaries"
];

export const paymentModes = [
    "CASH",
    "UPI"
];

export const createExpenseSchema = z.object({

    tankId: z.string().min(1, "Tank is required"),

    category: z.enum(expenseCategories),

    description: z.string().min(3),

    amount: z.number().positive(),

    paymentMode: z.enum(paymentModes),

    date: z.string(),

    notes: z.string().optional()

});

export const updateExpenseSchema = createExpenseSchema.partial();