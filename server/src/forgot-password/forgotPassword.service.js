import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { sendSMS, verifyTwilioCode } from "./otp.service.js";

/**
 * Helper to normalize mobile number for database queries.
 */
const normalizeMobile = (inputMobile) => {
  const cleanDigits = (inputMobile || "").replace(/\D/g, "");
  const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
  const e164Mobile = `+91${tenDigits}`;
  return { inputMobile: (inputMobile || "").trim(), tenDigits, e164Mobile };
};

/**
 * Service to handle sending real SMS OTP via Twilio Verify API.
 */
export const sendForgotPasswordOtp = async (inputMobile) => {
  const { inputMobile: raw, tenDigits, e164Mobile } = normalizeMobile(inputMobile);

  if (!tenDigits || tenDigits.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  // 1. Check if user exists with this registered mobile number
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: raw },
        { mobile: tenDigits },
        { mobile: e164Mobile },
      ],
    },
  });

  if (!user) {
    throw new Error("No account found with this mobile number. Please check the number or register.");
  }

  // 2. Dispatch real SMS via Twilio Verify API
  await sendSMS(tenDigits);

  // 3. Invalidate previous OTP sessions for this user in DB
  await prisma.passwordResetOtp.updateMany({
    where: {
      mobile: {
        in: [raw, tenDigits, e164Mobile],
      },
      used: false,
    },
    data: {
      used: true,
    },
  });

  // 4. Save active verification session record in database
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.passwordResetOtp.create({
    data: {
      mobile: tenDigits,
      otpHash: "TWILIO_VERIFY_PENDING",
      expiresAt,
      verified: false,
      used: false,
    },
  });

  return {
    success: true,
    message: "OTP sent successfully to your registered mobile number via Twilio SMS.",
  };
};

/**
 * Service to verify submitted OTP against Twilio Verify API.
 */
export const verifyForgotPasswordOtp = async ({ mobile, otp }) => {
  const { tenDigits, e164Mobile, inputMobile: raw } = normalizeMobile(mobile);

  // 1. Verify code directly against Twilio Verify API
  const twilioCheck = await verifyTwilioCode(tenDigits, otp);

  if (!twilioCheck.verified) {
    throw new Error("Invalid OTP code. Please enter the correct code sent to your mobile.");
  }

  // 2. Find and update the latest pending OTP session in DB
  const otpRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      mobile: {
        in: [raw, tenDigits, e164Mobile],
      },
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (otpRecord) {
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });
  }

  return {
    success: true,
    message: "OTP verified successfully. You can now reset your password.",
  };
};

/**
 * Service to reset user's password after successful Twilio OTP verification.
 */
export const resetForgotPassword = async ({ mobile, otp, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long.");
  }

  const { tenDigits, e164Mobile, inputMobile: raw } = normalizeMobile(mobile);

  // 1. Verify session record in DB or check Twilio Verify API
  const otpRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      mobile: {
        in: [raw, tenDigits, e164Mobile],
      },
      verified: true,
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    // Re-verify against Twilio as fallback
    const twilioCheck = await verifyTwilioCode(tenDigits, otp);
    if (!twilioCheck.verified) {
      throw new Error("Invalid or expired OTP session. Please request and verify a new OTP.");
    }
  }

  // 2. Find the user record
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: raw },
        { mobile: tenDigits },
        { mobile: e164Mobile },
      ],
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  // 3. Hash the new password securely
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. Update user password in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // 5. Mark OTP session as used
  if (otpRecord) {
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });
  }

  return {
    success: true,
    message: "Password reset successful! You can now log in with your new password.",
  };
};

export default {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
};
