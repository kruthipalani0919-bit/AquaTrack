import { z } from "zod";

export const sendOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit number"),
});

export const verifyOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit number"),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export const resetPasswordSchema = z
  .object({
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit number"),

    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be a 6-digit number"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });
