import express from "express";

import controller from "../controllers/index.js"

const router = express.Router();

router.get("/", controller.profile.getProfile);
router.put("/",  controller.profile.updateProfile);

export default router;
