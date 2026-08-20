import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateNumericOTP, sendSMS, verifyTwilioCode } from "./otp.service.js";

/**
 * Service to handle sending OTP for forgot password.
 */
export const sendForgotPasswordOtp = async (mobile) => {
  // 1. Check if user exists with this registered mobile number
  const user = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!user) {
    throw new Error("No account found with this mobile number.");
  }

  // 2. Invalidate any existing active/unverified OTPs for this mobile
  await prisma.passwordResetOtp.updateMany({
    where: {
      mobile,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // 3. Generate a new 6-digit OTP
  const rawOtp = generateNumericOTP(6);

  // 4. Hash the OTP securely
  const otpHash = await bcrypt.hash(rawOtp, 10);

  // 5. Expiration time: 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 6. Save OTP record in database
  await prisma.passwordResetOtp.create({
    data: {
      mobile,
      otpHash,
      expiresAt,
      verified: false,
      used: false,
    },
  });

  // 7. Dispatch SMS (via Twilio Verify API / Fast2SMS / Console fallback)
  await sendSMS(mobile, rawOtp);

  return {
    success: true,
    message: "OTP sent successfully to your registered mobile number.",
  };
};

/**
 * Service to verify submitted OTP.
 */
export const verifyForgotPasswordOtp = async ({ mobile, otp }) => {
  // 1. Check Twilio Verify API first if enabled
  const twilioCheck = await verifyTwilioCode(mobile, otp);

  // 2. Find the latest unused OTP record for this mobile
  const otpRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      mobile,
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw new Error("No OTP request found. Please request a new OTP.");
  }

  // 3. Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  // 4. Verify OTP against stored hash or Twilio Verify result
  let isValidOtp = twilioCheck.verified;
  if (!isValidOtp) {
    isValidOtp = await bcrypt.compare(otp, otpRecord.otpHash);
  }

  if (!isValidOtp) {
    throw new Error("Invalid OTP. Please check and try again.");
  }

  // 5. Mark OTP as verified
  await prisma.passwordResetOtp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return {
    success: true,
    message: "OTP verified successfully. You can now reset your password.",
  };
};

/**
 * Service to reset user's password after successful OTP verification.
 */
export const resetForgotPassword = async ({ mobile, otp, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match.");
  }

  // 1. Check for a verified, unused, and unexpired OTP record
  const otpRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      mobile,
      verified: true,
      used: false,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP session. Please verify your OTP again.");
  }

  // 2. Hash the new password using the existing bcrypt mechanism
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. Update the user's password in the database
  await prisma.user.update({
    where: { mobile },
    data: { password: hashedPassword },
  });

  // 4. Invalidate the OTP record so it cannot be reused
  await prisma.passwordResetOtp.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return {
    success: true,
    message: "Password reset successful. You can now log in with your new password.",
  };
};

export default {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
};
