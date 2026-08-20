import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "./forgotPassword.validation.js";
import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from "./forgotPassword.controller.js";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
