import express from "express";
import controller from "../controllers/index.js"
const router = express.Router();

router.get("/", controller.asset.getAsset);      
router.post("/buy", controller.asset.buyAsset);  
router.post("/sell", controller.asset.sellAsset);

export default router;