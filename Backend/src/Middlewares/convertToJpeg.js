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
const conversionQueue = new PQueue({ concurrency: 2 });

// export const convertToJpeg = async (req, res, next) => {
//     // if (!req.files || req.files.length === 0) return next();
//     if (!req.file) return next();

//     try {
//         const converted = await conversionQueue.add(async () => {
//             return await Promise.all(
//                 req.files.map(async (file) => {
//                     const ext = path.extname(file.originalname).toLowerCase();

//                     if (file.mimetype === "application/pdf" || ext === ".pdf") {
//                         return file;
//                     }

//                     let jpegBuffer;

//                     if (
//                         ext === ".heic" || ext === ".heif" ||
//                         file.mimetype === "image/heic" ||
//                         file.mimetype === "image/heif" ||
//                         file.mimetype === "application/octet-stream"
//                     ) {
//                         jpegBuffer = await heicConvert({
//                             buffer: file.buffer,
//                             format: "JPEG",
//                             quality: 0.85
//                         });
//                     } else {
//                         jpegBuffer = await sharp(file.buffer)
//                             .jpeg({ quality: 85 })
//                             .toBuffer();
//                     }

//                     return {
//                         ...file,
//                         buffer: jpegBuffer,
//                         mimetype: "image/jpeg",
//                         originalname: path.basename(file.originalname, ext) + ".jpeg",
//                     };
//                 })
//             );
//         });

//         req.files = converted;
//         next();
//     } catch (err) {
//         return res.status(400).json({
//             success: false,
//             message: "Image conversion failed: " + err.message
//         });
//     }
// };

const convertFileToJpeg = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.mimetype === "application/pdf" || ext === ".pdf") {
        return file;
    }

    const isHeic =
        ext === ".heic" ||
        ext === ".heif" ||
        file.mimetype === "image/heic" ||
        file.mimetype === "image/heif";

    const imageBuffer = isHeic
        ? Buffer.from(await heicConvert({
            buffer: file.buffer,
            format: "JPEG",
            quality: 0.82
        }))
        : file.buffer;

    const jpegBuffer = await sharp(imageBuffer)
        .rotate()
        .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

    return {
        ...file,
        buffer: jpegBuffer,
        size: jpegBuffer.length,
        mimetype: "image/jpeg",
        originalname: `${path.basename(file.originalname, ext)}.jpg`
    };
};

export const convertToJpeg = async (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) return next();

    try {
        const converted = await conversionQueue.add(() =>
            Promise.all(files.map(convertFileToJpeg))
        );

        if (req.files) {
            req.files = converted;
        } else {
            req.file = converted[0];
        }

        next();

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: `Image conversion failed: ${err.message}`
        });
    }
};
