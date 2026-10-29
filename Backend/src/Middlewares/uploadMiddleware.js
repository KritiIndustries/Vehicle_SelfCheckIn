import multer from "multer";
import path from "path";

export const uploadMassistExcel = multer({
    storage: multer.memoryStorage(),

    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const allowedExtensions = [".xlsx", ".xls"];

        if (!allowedExtensions.includes(ext)) {
            return cb(new Error("Only .xlsx and .xls Excel files are allowed"));
        }

        cb(null, true);
    },

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
});