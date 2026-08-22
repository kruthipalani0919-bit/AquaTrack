import { Router } from "express";

import { register } from "../controllers/auth.controller.js";

import validate from "../middleware/validate.middleware.js";

import { registerSchema } from "../validations/auth.validation.js";

import { login } from "../controllers/auth.controller.js";

import { loginSchema } from "../validations/auth.validation.js";

import auth from "../middleware/auth.middleware.js";

import { profile } from "../controllers/auth.controller.js";
const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);


router.post(
  "/login",
  validate(loginSchema),
  login
);

router.get(
    "/profile",
    auth,
    profile
);
export default router;