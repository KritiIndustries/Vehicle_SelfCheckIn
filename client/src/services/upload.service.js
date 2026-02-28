// services/upload.service.js
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const uploadWithProgress = async (
    endpoint,
    formData,
    onProgress
) => {
    return axios.post(`${API}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
            const percent = Math.round(
                (event.loaded * 100) / event.total
            );
            onProgress(percent);
        },
    });
};