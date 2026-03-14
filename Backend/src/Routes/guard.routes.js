import { Router } from "express";

import { approveEntry, checkoutVehicle, getCheckedinDetails } from "../Controllers/guard.controller.js";
import authMiddleware from "../Middlewares/authMiddleware.js";
import { getS3Image } from "../services/s3.service.js";

const router = Router();
router.get('/getCheckedinDetails', getCheckedinDetails);
router.patch("/approve/:id", approveEntry);
router.patch("/checkout/:id", checkoutVehicle);
router.get("/image/:folder/:subfolder/:filename", getS3Image);


export default router;