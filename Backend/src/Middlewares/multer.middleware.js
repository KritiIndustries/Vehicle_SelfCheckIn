// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// /* ========================= */
// /* FIX __dirname for ESM     */
// /* ========================= */

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ========================= */
// /* CREATE UPLOAD FOLDER      */
// /* ========================= */

// const uploadDir = path.join(__dirname, "../../uploads");

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// /* ========================= */
// /* STORAGE CONFIG            */
// /* ========================= */

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueName =
//             Date.now() +
//             "-" +
//             Math.round(Math.random() * 1e9) +
//             path.extname(file.originalname);

//         cb(null, uniqueName);
//     },
// });

// /* ========================= */
// /* FILE FILTER (SECURITY)    */
// /* ========================= */

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "application/pdf",
//     ];

//     if (!allowedTypes.includes(file.mimetype)) {
//         cb(new Error("Only images and PDFs allowed"), false);
//     } else {
//         cb(null, true);
//     }
// };

// /* ========================= */
// /* EXPORT MULTER INSTANCE    */
// /* ========================= */

// export const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB limit
//     },
// });

import multer from "multer";
import fs from "fs";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only images and PDFs allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});