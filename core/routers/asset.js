import express from "express";
import controller from "../controllers/index.js"
const router = express.Router();
import middlewares from "../middlewares/index.js";

router.get("/", controller.asset.getAsset);      
router.post("/buy", middlewares.rateLimiter(5, 60), controller.asset.buyAsset);  
router.post("/sell", middlewares.rateLimiter(5, 60), controller.asset.sellAsset);

export default router;