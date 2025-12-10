import express from "express";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import authMiddleware from "../middlewares/auth.js";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/profile",authMiddleware, profileRouter);
// router.use("/asset", assetRouter);
// router.use("/transaction", transactionRouter);
export default router;
