import express from "express";
import { parseMessage, confirmBooking } from "../controllers/llmController.js";

const router = express.Router();

router.post("/parse", parseMessage);
router.post("/confirm", confirmBooking);

export default router;
