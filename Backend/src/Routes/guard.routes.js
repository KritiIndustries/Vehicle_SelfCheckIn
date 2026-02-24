import { Router } from "express";
import { guardLogin } from "../Controllers/guard.controller.js";
const router = Router();

router.post("/guardLogin", guardLogin);

export default router;