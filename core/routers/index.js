import express from "express";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import middlewares from "../middlewares/index.js";
import walletRouter from "./wallet.js"
import assetRouter from "./asset.js"
import transactionRouter from "./transaction.js"
import productRouter from "./product.js"
import tradesRouter from "./trades.js"
import orderRouter from "./order.js"
const router = express.Router();

router.use("/auth", authRouter);
router.use("/profile",middlewares.auth, profileRouter);
router.use("/wallet", middlewares.auth, middlewares.idempotency, walletRouter);
router.use("/asset", middlewares.auth, middlewares.idempotency, assetRouter);
router.use("/transaction", middlewares.auth,  transactionRouter);
router.use("/product", middlewares.auth, productRouter);
router.use("/trades", middlewares.auth, middlewares.idempotency, tradesRouter);
router.use("/order", middlewares.auth, orderRouter);
export default router;
