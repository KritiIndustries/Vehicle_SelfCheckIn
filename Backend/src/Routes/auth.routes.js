import { Router } from "express";
import { guardLogin } from "../Controllers/guard.controller.js";
import { verifyOtp } from "../Controllers/auth.controller.js";
const router = Router();

router.post("/send-otp", guardLogin);
router.post("/verify-otp", verifyOtp);

export default router;