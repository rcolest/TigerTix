import express from "express";
import * as authController from "../controllers/userAuthController.js";

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutAccount);

export default router;
