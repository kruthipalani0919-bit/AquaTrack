import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
} from "./forgotPassword.service.js";

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const result = await sendForgotPasswordOtp(mobile);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await verifyForgotPasswordOtp(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await resetForgotPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Password reset failed",
    });
  }
};
