import express from "express";
import controller from "../controllers/index.js";

const router = express.Router();

router.get("/", controller.transaction.getTransactions);

export default router;