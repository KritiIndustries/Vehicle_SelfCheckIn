import express from "express";
import multer from "multer";
import { uploadMassistExcel } from "../Middlewares/uploadMiddleware.js";
import { uploadMassistReport } from "../Controllers/massistController.js";
import verticalHeadReportRoutes from "./verticalHeadReportRoutes.js";

const router = express.Router();

router.use("/", verticalHeadReportRoutes);

router.post(
    "/upload",
    (req, res, next) => {
        uploadMassistExcel.single("file")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            next();
        });
    },
    uploadMassistReport
);

export default router;