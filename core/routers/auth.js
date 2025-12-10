import express from "express";
import { validateSignup, validateLogin } from "../validators/index.js";

import controller from "../controllers/index.js"

const router = express.Router();

router.post("/signup", validateSignup, controller.auth.signup);
router.post("/login", validateLogin, controller.auth.login);

export default router;

