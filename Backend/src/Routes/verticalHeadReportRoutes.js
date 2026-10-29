import express from "express";
import { triggerVerticalHeadReports } from "../Controllers/verticalHeadReportController.js";

const router = express.Router();

router.post("/vertical-head-report", triggerVerticalHeadReports);

export default router;
