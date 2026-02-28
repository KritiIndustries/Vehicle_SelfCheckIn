import { Router } from "express";
import authMiddleware from "../Middlewares/authMiddleware.js";
import ipRestrictionMiddleware from "../Middlewares/ipRestriction.middleware.js";
import geofenceMiddleware from "../Middlewares/geofence.middleware.js";
import { finalizeCheckin, uploadDoc, uploadTempDocument, uploadTempSelfie } from "../Controllers/driver.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import multer from "multer";
const router = Router();
// router.post(
//     "/upload-doc",
//     // Parse multipart/form-data first so `req.body` fields (latitude/longitude)
//     // are available to the geofence middleware.
//     upload.single("document"),
//     geofenceMiddleware,
//     uploadDoc
// );
// router.post("/upload-doc", upload.single("document"), uploadTempDocument);
router.post(
    "/upload-doc",
    (req, res, next) => {

        upload.single("document")(req, res, function (err) {

            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            next();
        });

    },
    uploadTempDocument
);
router.post("/upload-selfie", upload.single("selfie"), uploadTempSelfie);
router.post("/finalize", finalizeCheckin);
export default router;