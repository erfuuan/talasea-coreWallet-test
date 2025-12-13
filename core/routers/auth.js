import express from "express";

import controller from "../controllers/index.js"

const router = express.Router();

router.post("/signup",  controller.auth.signup);
router.post("/login", controller.auth.login);

export default router;

