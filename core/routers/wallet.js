import express from "express";
import controller from "../controllers/index.js"
import middlewares from "../middlewares/index.js";
const router = express.Router();
router.get("/",  controller.wallet.getWallet);
router.post("/deposit", middlewares.rateLimiter(5, 60), controller.wallet.deposit);
router.post("/withdraw", middlewares.rateLimiter(3, 60), controller.wallet.withdraw);

export default router;