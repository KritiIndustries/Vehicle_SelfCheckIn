import { Router } from "express";
import { exportDriverCheckInExcel } from "../Controllers/admin.controller.js";
import { exportAuth } from "../Middlewares/authMiddleware.js";
const router = Router();

router.get("/export/excel", exportAuth, exportDriverCheckInExcel);

export default router;