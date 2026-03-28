// import sharp from "sharp";
// import path from "path";

// // ✅ Convert any uploaded image to JPEG after multer processes it
// export const convertToJpeg = async (req, res, next) => {
//     if (!req.files || req.files.length === 0) return next();

//     try {
//         const converted = await Promise.all(
//             req.files.map(async (file) => {
//                 const ext = path.extname(file.originalname).toLowerCase();

//                 // Skip PDFs — only convert images
//                 if (file.mimetype === "application/pdf" || ext === ".pdf") {
//                     return file;
//                 }

//                 // ✅ Convert everything else to JPEG
//                 const jpegBuffer = await sharp(file.buffer)
//                     .jpeg({ quality: 85 })
//                     .toBuffer();

//                 return {
//                     ...file,
//                     buffer: jpegBuffer,
//                     mimetype: "image/jpeg",
//                     originalname: path.basename(file.originalname, ext) + ".jpeg",
//                 };
//             })
//         );

//         req.files = converted;
//         next();
//     } catch (err) {
//         return res.status(400).json({
//             success: false,
//             message: "Image conversion failed: " + err.message
//         });
//     }
// };



// export const convertToJpeg = async (req, res, next) => {
//     if (!req.files || req.files.length === 0) return next();

//     try {
//         const converted = await Promise.all(
//             req.files.map(async (file) => {
//                 const ext = path.extname(file.originalname).toLowerCase();

//                 // Skip PDFs
//                 if (file.mimetype === "application/pdf" || ext === ".pdf") {
//                     return file;
//                 }

//                 let jpegBuffer;

//                 // ✅ HEIC/HEIF — use heic-convert first
//                 if (
//                     ext === ".heic" || ext === ".heif" ||
//                     file.mimetype === "image/heic" ||
//                     file.mimetype === "image/heif" ||
//                     file.mimetype === "application/octet-stream" // iOS sends this
//                 ) {
//                     try {
//                         jpegBuffer = await heicConvert({
//                             buffer: file.buffer,
//                             format: "JPEG",
//                             quality: 0.85
//                         });
//                     } catch (heicErr) {
//                         // If heic-convert fails, try sharp as fallback
//                         jpegBuffer = await sharp(file.buffer)
//                             .jpeg({ quality: 85 })
//                             .toBuffer();
//                     }
//                 } else {
//                     // ✅ All other images — use sharp
//                     jpegBuffer = await sharp(file.buffer)
//                         .jpeg({ quality: 85 })
//                         .toBuffer();
//                 }

//                 return {
//                     ...file,
//                     buffer: jpegBuffer,
//                     mimetype: "image/jpeg",
//                     originalname: path.basename(file.originalname, ext) + ".jpeg",
//                 };
//             })
//         );

//         req.files = converted;
//         next();
//     } catch (err) {
//         return res.status(400).json({
//             success: false,
//             message: "Image conversion failed: " + err.message
//         });
//     }
// };


import PQueue from "p-queue";
import sharp from "sharp";
import heicConvert from "heic-convert";
import path from "path";
// Install: npm install p-queue
const conversionQueue = new PQueue({ concurrency: 10 }); // max 10 at once

export const convertToJpeg = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const converted = await conversionQueue.add(async () => {
            return await Promise.all(
                req.files.map(async (file) => {
                    const ext = path.extname(file.originalname).toLowerCase();

                    if (file.mimetype === "application/pdf" || ext === ".pdf") {
                        return file;
                    }

                    let jpegBuffer;

                    if (
                        ext === ".heic" || ext === ".heif" ||
                        file.mimetype === "image/heic" ||
                        file.mimetype === "image/heif" ||
                        file.mimetype === "application/octet-stream"
                    ) {
                        jpegBuffer = await heicConvert({
                            buffer: file.buffer,
                            format: "JPEG",
                            quality: 0.85
                        });
                    } else {
                        jpegBuffer = await sharp(file.buffer)
                            .jpeg({ quality: 85 })
                            .toBuffer();
                    }

                    return {
                        ...file,
                        buffer: jpegBuffer,
                        mimetype: "image/jpeg",
                        originalname: path.basename(file.originalname, ext) + ".jpeg",
                    };
                })
            );
        });

        req.files = converted;
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Image conversion failed: " + err.message
        });
    }
};