import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
});


export const loginSchema = z.object({

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  password: z
    .string()
    .min(1, "Password is required")

});