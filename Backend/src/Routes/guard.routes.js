import { Router } from "express";

import { approveEntry, checkoutVehicle, getCheckedinDetails, uploadNumberPlate } from "../Controllers/guard.controller.js";
import authMiddleware from "../Middlewares/authMiddleware.js";
import { getS3Image } from "../services/s3.service.js";
import { convertToJpeg } from "../Middlewares/convertToJpeg.js";
import { upload } from "../Middlewares/multer.middleware.js";
import multer from "multer";

const router = Router();
router.get('/getCheckedinDetails', getCheckedinDetails);
router.patch("/approve/:id", authMiddleware, approveEntry);
router.patch("/checkout/:id", authMiddleware, checkoutVehicle);
router.get("/image/:folder/:subfolder/:filename", getS3Image);
router.post(
    "/upload-number-plate",
    authMiddleware,  // ✅ only guard can upload
    (req, res, next) => {
        upload.single("numberPlate")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ success: false, message: err.message });
            }
            if (err) return res.status(400).json({ success: false, message: err.message });
            next();
        });
    },
    convertToJpeg,
    uploadNumberPlate
);


export default router;