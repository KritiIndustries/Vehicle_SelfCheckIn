// export const uploadDriverDocument = async (key, file, onProgress) => {
//     const formData = new FormData();
//     formData.append("document", file);
//     formData.append("type", key);

import { compressImage } from "./image.service";
import { getCurrentLocation } from "./location.service";
import { uploadWithProgress } from "./upload.service";

//     const location = await getCurrentLocation();
//     formData.append("latitude", location.lat);
//     formData.append("longitude", location.lng);

//     return uploadWithProgress(
//         "/api/driver/upload-doc",
//         formData,
//         onProgress
//     );
// };
// services/driver.service.js



export const uploadDriverDocument = async (
    docType,
    file,
    onProgress
) => {
    let processedFile = file;

    // Compress only images
    if (file.type.startsWith("image/")) {
        processedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append("document", processedFile);
    formData.append("type", docType);

    // Optional GPS tagging
    try {
        const location = await getCurrentLocation();
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
    } catch (error) {
        console.warn("GPS not available:", error);
    }

    await uploadWithProgress(
        "/api/driver/upload-doc",
        formData,
        onProgress
    );

    return processedFile;
};