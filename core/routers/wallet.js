import express from "express";
import controller from "../controllers/index.js"

const router = express.Router();
router.get("/",  controller.wallet.getWallet);
router.post("/deposit", controller.wallet.deposit);
router.post("/withdraw", controller.wallet.withdraw);

export default router;