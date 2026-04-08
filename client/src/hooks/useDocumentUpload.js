// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000;

// const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// export const useDocumentUpload = ({
//     apiUrl,
//     requiredDocs = ["dl", "rc", "insurance", "fitness"],
//     sessionId,
//     doNumber,
//     onAllSuccess, // callback when all uploaded
// }) => {
//     const [docs, setDocs] = useState(() => {
//         const initial = {};
//         requiredDocs.forEach((d) => {
//             initial[d] = {
//                 file: null,
//                 progress: 0,
//                 uploading: false,
//                 uploaded: false,
//                 error: null,
//             };
//         });
//         return initial;
//     });

//     const [loading, setLoading] = useState(false);

//     // ✅ check all uploaded
//     const isAllUploaded = useCallback(() => {
//         return requiredDocs.every((d) => docs[d]?.uploaded === true);
//     }, [docs, requiredDocs]);

//     // ✅ watch completion
//     useEffect(() => {
//         if (isAllUploaded()) {
//             onAllSuccess?.(docs);
//         }
//     }, [docs, isAllUploaded, onAllSuccess]);

//     // ✅ single upload with retry
//     const uploadSingle = async (key, file) => {
//         const formData = new FormData();
//         formData.append("sessionId", sessionId);
//         formData.append("doNumber", doNumber);
//         formData.append("type", key);
//         formData.append("document", file);

//         setDocs((prev) => ({
//             ...prev,
//             [key]: {
//                 ...prev[key],
//                 uploading: true,
//                 uploaded: false,
//                 progress: 0,
//                 error: null,
//                 file,
//             },
//         }));

//         let lastError = null;
//         let res = null;

//         for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//             try {
//                 res = await axios.post(`${apiUrl}/upload-single`, formData, {
//                     headers: { "Content-Type": "multipart/form-data" },
//                     timeout: 30000,
//                     onUploadProgress: (e) => {
//                         const percent = Math.round((e.loaded * 100) / e.total);

//                         setDocs((prev) => ({
//                             ...prev,
//                             [key]: {
//                                 ...prev[key],
//                                 progress: percent,
//                             },
//                         }));
//                     },
//                 });

//                 break; // success
//             } catch (err) {
//                 lastError = err;

//                 const status = err.response?.status;

//                 if (status && status >= 400 && status < 500) {
//                     break; // no retry
//                 }

//                 if (attempt < MAX_RETRIES) {
//                     await sleep(RETRY_DELAY * attempt);
//                 }
//             }
//         }

//         if (!res) {
//             const message =
//                 lastError?.response?.data?.message || "Upload failed";

//             setDocs((prev) => ({
//                 ...prev,
//                 [key]: {
//                     ...prev[key],
//                     uploading: false,
//                     uploaded: false,
//                     progress: 0,
//                     error: message,
//                 },
//             }));

//             return;
//         }

//         // ✅ success
//         setDocs((prev) => ({
//             ...prev,
//             [key]: {
//                 ...prev[key],
//                 uploading: false,
//                 uploaded: true,
//                 progress: 100,
//                 error: null,
//             },
//         }));

//         return res.data;
//     };

//     // ✅ parallel upload all
//     const uploadAll = async () => {
//         setLoading(true);

//         const promises = requiredDocs.map((key) => {
//             const file = docs[key]?.file;

//             if (!file) {
//                 return Promise.reject(`${key} missing`);
//             }

//             return uploadSingle(key, file);
//         });

//         try {
//             await Promise.all(promises);
//         } catch (err) {
//             console.error("Some uploads failed:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ set file
//     const setFile = (key, file) => {
//         const preview = file.type.startsWith("image/")
//             ? URL.createObjectURL(file)
//             : null;

//         setDocs((prev) => ({
//             ...prev,
//             [key]: {
//                 ...prev[key],
//                 file,
//                 preview,
//                 uploaded: false,
//                 error: null,
//             },
//         }));
//     };

//     // ✅ reset
//     const resetDoc = (key) => {
//         setDocs((prev) => ({
//             ...prev,
//             [key]: {
//                 file: null,
//                 progress: 0,
//                 uploading: false,
//                 uploaded: false,
//                 error: null,
//             },
//         }));
//     };

//     return {
//         docs,
//         loading,
//         setFile,
//         uploadSingle,
//         uploadAll,
//         resetDoc,
//         isAllUploaded,
//     };
// };

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const useDocumentUpload = ({
    apiUrl,
    requiredDocs = ["dl", "rc", "insurance", "fitness"],
    sessionId,
    doNumber,
    onAllSuccess,
}) => {
    const [docs, setDocs] = useState(() => {
        const initial = {};
        requiredDocs.forEach((d) => {
            initial[d] = {
                file: null,
                preview: null,
                progress: 0,
                uploading: false,
                uploaded: false,
                error: null,
            };
        });
        return initial;
    });

    const [responses, setResponses] = useState({});

    const isAllUploaded = useCallback(() => {
        return requiredDocs.every((d) => docs[d]?.uploaded === true);
    }, [docs, requiredDocs]);

    // useEffect(() => {
    //     if (isAllUploaded()) {
    //         onAllSuccess?.({
    //             docs,
    //             responses, // ✅ OCR + API response
    //         });
    //     }
    // }, [docs]);
    useEffect(() => {
        const allUploaded = requiredDocs.every(d => docs[d]?.uploaded);
        const allResponses = requiredDocs.every(d => responses[d]);

        if (allUploaded && allResponses) {
            onAllSuccess?.({
                docs,
                responses,
            });
        }
    }, [docs, responses]);

    const uploadSingle = async (key, file) => {
        const formData = new FormData();
        formData.append("sessionId", sessionId);
        formData.append("doNumber", doNumber);
        formData.append("type", key);
        formData.append("document", file);

        setDocs((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                uploading: true,
                uploaded: false,
                progress: 0,
                error: null,
                file,
            },
        }));

        let res = null;
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                res = await axios.post(`${apiUrl}/upload-single`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => {
                        const percent = Math.round((e.loaded * 100) / e.total);

                        setDocs((prev) => ({
                            ...prev,
                            [key]: {
                                ...prev[key],
                                progress: percent,
                            },
                        }));
                    },
                });

                break;
            } catch (err) {
                lastError = err;

                if (attempt < MAX_RETRIES) {
                    await sleep(RETRY_DELAY * attempt);
                }
            }
        }

        if (!res) {
            setDocs((prev) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    uploading: false,
                    uploaded: false,
                    progress: 0,
                    error: "Upload failed",
                },
            }));
            return;
        }

        // ✅ SUCCESS
        setDocs((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                uploading: false,
                uploaded: true,
                progress: 100,
                error: null,
            },
        }));

        // ✅ STORE RESPONSE (OCR)
        setResponses((prev) => ({
            ...prev,
            [key]: res.data,
        }));
    };

    const setFile = (key, file) => {
        const preview = file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null;

        setDocs((prev) => {
            // cleanup old preview
            if (prev[key]?.preview) {
                URL.revokeObjectURL(prev[key].preview);
            }

            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    file,
                    preview,
                    uploaded: false,
                    error: null,
                },
            };
        });
    };

    return {
        docs,
        setFile,
        uploadSingle,
    };
};