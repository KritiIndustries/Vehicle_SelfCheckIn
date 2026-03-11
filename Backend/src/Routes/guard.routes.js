import { Router } from "express";

import { getCheckedinDetails } from "../Controllers/guard.controller.js";
import authMiddleware from "../Middlewares/authMiddleware.js";
import { getS3Image } from "../services/s3.service.js";

const router = Router();
router.get('/getCheckedinDetails', getCheckedinDetails);
router.get("/image/:folder/:subfolder/:filename", getS3Image);


export default router;