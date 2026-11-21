import { Router } from "express";
import { exportDriverCheckInExcel } from "../Controllers/admin.controller.js";
const router = Router();

router.get("/export/excel", exportDriverCheckInExcel);

export default router;