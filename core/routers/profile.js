import express from "express";

import controller from "../controllers/index.js"
import { validateUpdateProfile } from "../validators/index.js";

const router = express.Router();

router.get("/", controller.profile.getProfile);
router.put("/", validateUpdateProfile, controller.profile.updateProfile);

export default router;
