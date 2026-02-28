import { Router } from "express";

import { getCheckedinDetails } from "../Controllers/guard.controller.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = Router();
router.get('/getCheckedinDetails', getCheckedinDetails);


export default router;