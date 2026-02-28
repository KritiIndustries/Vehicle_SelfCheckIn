// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FileText, Car, Shield, Award, Check, Camera, Upload, Image, X } from "lucide-react";
// import AppHeader from "@/components/AppHeader";
// import StepIndicator from "@/components/StepIndicator";
// import InfoBanner from "@/components/InfoBanner";

// const docTypes = [
//     { key: "dl", label: "Driving License", labelHi: "ड्राइविंग लाइसेंस", icon: FileText },
//     { key: "rc", label: "Vehicle RC", labelHi: "गाड़ी की आरसी", icon: Car },
//     { key: "insurance", label: "Insurance", labelHi: "बीमा", icon: Shield },
//     { key: "fitness", label: "Fitness Cert", labelHi: "फिटनेस प्रमाण पत्र", icon: Award },
// ];

// const DocumentUpload = () => {
//     const navigate = useNavigate();
//     const [docs, setDocs] = useState({
//         dl: { uploaded: false },
//         rc: { uploaded: false },
//         insurance: { uploaded: false },
//         fitness: { uploaded: false },
//     });
//     const [showPicker, setShowPicker] = useState(null);

//     const handleUpload = (key) => {
//         setShowPicker(key);
//     };

//     const simulateUpload = (key) => {
//         setDocs((prev) => ({
//             ...prev,
//             [key]: { uploaded: true, name: `${key}_document.jpg` },
//         }));
//         setShowPicker(null);
//     };

//     const allUploaded = Object.values(docs).every((d) => d.uploaded);

//     return (
//         <div className="mobile-container">
//             <AppHeader />
//             <div className="page-content">
//                 <div className="mt-2 mb-2">
//                     <StepIndicator currentStep={2} totalSteps={4} label="Upload Documents" labelHi="दस्तावेज़ अपलोड करें" />
//                     <p className="text-sm text-muted-foreground mt-1 mb-3">
//                         Please upload the following valid documents.<br />
//                         कृपया निम्नलिखित वैध दस्तावेज़ अपलोड करें
//                     </p>
//                 </div>

//                 <InfoBanner text="Tap below to upload" textHi="अपलोड करने के लिए नीचे टैप करें" />

//                 <div className="grid grid-cols-2 gap-3 mt-4">
//                     {docTypes.map((doc) => {
//                         const state = docs[doc.key];
//                         const Icon = doc.icon;
//                         return (
//                             <button
//                                 key={doc.key}
//                                 onClick={() => !state.uploaded && handleUpload(doc.key)}
//                                 className={state.uploaded ? "card-upload-done" : "card-upload"}
//                             >
//                                 {state.uploaded && (
//                                     <div className="absolute top-2 right-2 w-5 h-5 bg-success rounded-full flex items-center justify-center">
//                                         <Check className="w-3 h-3 text-success-foreground" />
//                                     </div>
//                                 )}
//                                 <Icon className={`w-8 h-8 ${state.uploaded ? "text-success" : "text-muted-foreground"}`} />
//                                 <span className="text-sm font-medium text-foreground">{doc.label}</span>
//                                 <span className="text-xs text-muted-foreground">{doc.labelHi}</span>
//                             </button>
//                         );
//                     })}
//                 </div>
//             </div>

//             <div className="page-bottom">
//                 <button
//                     onClick={() => navigate("/driver/selfie")}
//                     disabled={!allUploaded}
//                     className="btn-primary-full disabled:opacity-50"
//                 >
//                     Next / आगे बढ़ें →
//                 </button>
//             </div>

//             {showPicker && (
//                 <div className="fixed inset-0 z-50 flex items-end justify-center">

//                     {/* BACKDROP */}
//                     <div
//                         className="absolute inset-0"
//                         style={{ background: "hsl(var(--foreground) / 0.4)" }}
//                         onClick={() => setShowPicker(null)}
//                     />

//                     {/* SHEET */}
//                     <div
//                         className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl transition-all duration-300 animate-[slideUp_0.25s_ease-out]"
//                         style={{
//                             background: "hsl(var(--card))",
//                         }}
//                     >
//                         <h3
//                             className="text-lg font-semibold text-center mb-1"
//                             style={{ color: "hsl(var(--foreground))" }}
//                         >
//                             Select Option / विकल्प चुनें
//                         </h3>

//                         <div className="grid grid-cols-3 gap-4 mt-5">
//                             <button
//                                 onClick={() => simulateUpload(showPicker)}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Camera className="w-6 h-6" />
//                                 </div>
//                                 <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
//                                     Take Photo
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     फोटो ले
//                                 </span>
//                             </button>

//                             <button
//                                 onClick={() => simulateUpload(showPicker)}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Upload className="w-6 h-6" />
//                                 </div>
//                                 <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
//                                     Upload PDF
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     पीडीएफ अपलोड
//                                 </span>
//                             </button>

//                             <button
//                                 onClick={() => simulateUpload(showPicker)}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Image className="w-6 h-6" />
//                                 </div>
//                                 <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
//                                     Gallery
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     गैलरी
//                                 </span>
//                             </button>
//                         </div>

//                         <button
//                             onClick={() => setShowPicker(null)}
//                             className="w-full text-center text-sm font-medium mt-6"
//                             style={{ color: "hsl(var(--destructive))" }}
//                         >
//                             Cancel / रद्द करें
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default DocumentUpload;

// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     FileText,
//     Car,
//     Shield,
//     Award,
//     Check,
//     Camera,
//     Upload,
//     Image
// } from "lucide-react";
// import axios from "axios";
// import AppHeader from "@/components/AppHeader";
// import StepIndicator from "@/components/StepIndicator";
// import InfoBanner from "@/components/InfoBanner";
// import { uploadDriverDocument } from "@/services/driver.service";

// const API = import.meta.env.VITE_API_BASE_URL;

// const docTypes = [
//     { key: "dl", label: "Driving License", labelHi: "ड्राइविंग लाइसेंस", icon: FileText },
//     { key: "rc", label: "Vehicle RC", labelHi: "गाड़ी की आरसी", icon: Car },
//     { key: "insurance", label: "Insurance", labelHi: "बीमा", icon: Shield },
//     { key: "fitness", label: "Fitness Cert", labelHi: "फिटनेस प्रमाण पत्र", icon: Award },
// ];
// const getSessionId = () => {
//     let sessionId = localStorage.getItem("driver_session");
//     if (!sessionId) {
//         sessionId = uuidv4();
//         localStorage.setItem("driver_session", sessionId);
//     }
//     return sessionId;
// };

// const DocumentUpload = () => {
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);

//     const [docs, setDocs] = useState({});
//     const [showPicker, setShowPicker] = useState(null);
//     const [currentDocKey, setCurrentDocKey] = useState(null);

//     /* ========================= */
//     /* OPEN PICKER */
//     /* ========================= */

//     const openPicker = (key) => {
//         setCurrentDocKey(key);
//         setShowPicker(true);
//     };

//     /* ========================= */
//     /* FILE SELECTION */
//     /* ========================= */

//     // const triggerFileInput = (type) => {
//     //     if (!fileInputRef.current) return;

//     //     if (type === "camera") {
//     //         fileInputRef.current.accept = "image/*";
//     //         fileInputRef.current.capture = "environment";
//     //     }

//     //     if (type === "gallery") {
//     //         fileInputRef.current.accept = "image/*";
//     //         fileInputRef.current.removeAttribute("capture");
//     //     }

//     //     if (type === "pdf") {
//     //         fileInputRef.current.accept = "application/pdf";
//     //         fileInputRef.current.removeAttribute("capture");
//     //     }

//     //     fileInputRef.current.click();
//     // };

//     const triggerFileInput = (type) => {
//         if (!fileInputRef.current) return;

//         if (type === "camera") {
//             fileInputRef.current.camera?.click();
//         }

//         if (type === "gallery") {
//             fileInputRef.current.gallery?.click();
//         }

//         if (type === "pdf") {
//             fileInputRef.current.pdf?.click();
//         }
//     };
//     const handleFileSelect = async (file) => {
//         if (!file || !currentDocKey) return;

//         setShowPicker(null);

//         try {
//             // Initial state
//             setDocs((prev) => ({
//                 ...prev,
//                 [currentDocKey]: {
//                     preview:
//                         file.type === "application/pdf"
//                             ? null
//                             : URL.createObjectURL(file),
//                     progress: 0,
//                     uploading: true,
//                     uploaded: false,
//                 },
//             }));

//             const processedFile = await uploadDriverDocument(
//                 currentDocKey,
//                 file,
//                 (percent) => {
//                     setDocs((prev) => ({
//                         ...prev,
//                         [currentDocKey]: {
//                             ...prev[currentDocKey],
//                             progress: percent,
//                         },
//                     }));
//                 }
//             );

//             // After success
//             setDocs((prev) => ({
//                 ...prev,
//                 [currentDocKey]: {
//                     ...prev[currentDocKey],
//                     file: processedFile,
//                     uploading: false,
//                     uploaded: true,
//                     progress: 100,
//                 },
//             }));

//         } catch (error) {
//             console.error(error);

//             setDocs((prev) => ({
//                 ...prev,
//                 [currentDocKey]: {
//                     ...prev[currentDocKey],
//                     uploading: false,
//                 },
//             }));
//         }
//     };

//     /* ========================= */
//     /* FILE UPLOAD WITH PROGRESS */
//     /* ========================= */

//     const uploadFile = async (key, file) => {
//         const formData = new FormData();
//         formData.append("document", file);
//         formData.append("type", key);

//         // Optional: attach GPS for compliance
//         try {
//             const location = await getCurrentLocation();
//             formData.append("latitude", location.lat);
//             formData.append("longitude", location.lng);
//         } catch {
//             console.warn("Location not available");
//         }

//         try {
//             await uploadWithProgress(
//                 "/api/driver/upload-doc",
//                 formData,
//                 (percent) => {
//                     setDocs((prev) => ({
//                         ...prev,
//                         [key]: {
//                             ...prev[key],
//                             progress: percent,
//                         },
//                     }));
//                 }
//             );

//             setDocs((prev) => ({
//                 ...prev,
//                 [key]: {
//                     ...prev[key],
//                     uploading: false,
//                     uploaded: true,
//                     progress: 100,
//                 },
//             }));

//         } catch (error) {
//             console.error(error);
//             setDocs((prev) => ({
//                 ...prev,
//                 [key]: {
//                     ...prev[key],
//                     uploading: false,
//                 },
//             }));
//         }
//     };

//     const onInputChange = (e) => {
//         const file = e.target.files[0];
//         handleFileSelect(file);
//         e.target.value = "";
//     };

//     const allUploaded =
//         docTypes.every((d) => docs[d.key]?.uploaded);

//     return (
//         <div className="mobile-container">
//             <AppHeader />

//             <div className="page-content">
//                 <StepIndicator
//                     currentStep={2}
//                     totalSteps={4}
//                     label="Upload Documents"
//                     labelHi="दस्तावेज़ अपलोड करें"
//                 />

//                 <InfoBanner
//                     text="Tap below to upload"
//                     textHi="अपलोड करने के लिए नीचे टैप करें"
//                 />

//                 {/* DOCUMENT GRID */}
//                 <div className="grid grid-cols-2 gap-3 mt-4">
//                     {docTypes.map((doc) => {
//                         const state = docs[doc.key];
//                         const Icon = doc.icon;

//                         return (
//                             <button
//                                 key={doc.key}
//                                 onClick={() => openPicker(doc.key)}
//                                 className="relative card-upload"
//                             >
//                                 {state?.uploaded && (
//                                     <div className="absolute top-2 right-2 w-5 h-5 bg-success rounded-full flex items-center justify-center">
//                                         <Check className="w-3 h-3 text-success-foreground" />
//                                     </div>
//                                 )}

//                                 {/* PREVIEW */}
//                                 {state?.preview ? (
//                                     <img
//                                         src={state.preview}
//                                         alt="preview"
//                                         className="w-full h-20 object-cover rounded-md mb-2"
//                                     />
//                                 ) : (
//                                     <Icon className="w-8 h-8 text-muted-foreground mb-2" />
//                                 )}

//                                 <span className="text-sm font-medium">
//                                     {doc.label}
//                                 </span>

//                                 {/* PROGRESS BAR */}
//                                 {state?.uploading && (
//                                     <div className="w-full mt-2">
//                                         <div className="h-1 bg-muted rounded-full overflow-hidden">
//                                             <div
//                                                 className="h-full bg-primary transition-all"
//                                                 style={{
//                                                     width: `${state.progress}%`,
//                                                 }}
//                                             />
//                                         </div>
//                                         <p className="text-xs mt-1 text-muted-foreground">
//                                             {state.progress}%
//                                         </p>
//                                     </div>
//                                 )}

//                                 {state?.file?.type === "application/pdf" && (
//                                     <p className="text-xs text-muted-foreground mt-1">
//                                         PDF Selected
//                                     </p>
//                                 )}
//                             </button>
//                         );
//                     })}
//                 </div>
//             </div>

//             <div className="page-bottom">
//                 <button
//                     onClick={() => navigate("/driver/selfie")}
//                     // disabled={!allUploaded}
//                     className="btn-primary-full disabled:opacity-50"
//                 >
//                     Next / आगे बढ़ें →
//                 </button>
//             </div>

//             {/* SELECT OPTION SHEET */}
//             {showPicker && (
//                 <div className="fixed inset-0 z-50 flex items-end justify-center">
//                     {/* CAMERA INPUT */}
//                     <input
//                         type="file"
//                         accept="image/*"
//                         capture="environment"
//                         ref={(el) => (fileInputRef.current = { ...fileInputRef.current, camera: el })}
//                         onChange={onInputChange}
//                         className="hidden"
//                     />

//                     {/* GALLERY INPUT */}
//                     <input
//                         type="file"
//                         accept="image/*"
//                         ref={(el) => (fileInputRef.current = { ...fileInputRef.current, gallery: el })}
//                         onChange={onInputChange}
//                         className="hidden"
//                     />

//                     {/* PDF INPUT */}
//                     <input
//                         type="file"
//                         accept="application/pdf"
//                         ref={(el) => (fileInputRef.current = { ...fileInputRef.current, pdf: el })}
//                         onChange={onInputChange}
//                         className="hidden"
//                     />
//                     {/* BACKDROP */}
//                     <div
//                         className="absolute inset-0"
//                         style={{ background: "hsl(var(--foreground) / 0.4)" }}
//                         onClick={() => setShowPicker(null)}
//                     />

//                     {/* SHEET */}
//                     <div
//                         className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl transition-all duration-300 animate-[slideUp_0.25s_ease-out]"
//                         style={{
//                             background: "hsl(var(--card))",
//                         }}
//                     >
//                         <h3
//                             className="text-lg font-semibold text-center mb-1"
//                             style={{ color: "hsl(var(--foreground))" }}
//                         >
//                             Select Option / विकल्प चुनें
//                         </h3>

//                         <div className="grid grid-cols-3 gap-4 mt-5">

//                             {/* TAKE PHOTO */}
//                             <button
//                                 onClick={() => triggerFileInput("camera")}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Camera className="w-6 h-6" />
//                                 </div>
//                                 <span
//                                     style={{ color: "hsl(var(--foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     Take Photo
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     फोटो ले
//                                 </span>
//                             </button>

//                             {/* PDF UPLOAD */}
//                             <button
//                                 onClick={() => triggerFileInput("pdf")}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Upload className="w-6 h-6" />
//                                 </div>
//                                 <span
//                                     style={{ color: "hsl(var(--foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     Upload PDF
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     पीडीएफ अपलोड
//                                 </span>
//                             </button>

//                             {/* GALLERY */}
//                             <button
//                                 onClick={() => triggerFileInput("gallery")}
//                                 className="flex flex-col items-center gap-2"
//                             >
//                                 <div
//                                     className="w-14 h-14 rounded-full flex items-center justify-center"
//                                     style={{ background: "hsl(var(--muted))" }}
//                                 >
//                                     <Image className="w-6 h-6" />
//                                 </div>
//                                 <span
//                                     style={{ color: "hsl(var(--foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     Gallery
//                                 </span>
//                                 <span
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                     className="text-xs"
//                                 >
//                                     गैलरी
//                                 </span>
//                             </button>
//                         </div>

//                         <button
//                             onClick={() => setShowPicker(null)}
//                             className="w-full text-center text-sm font-medium mt-6"
//                             style={{ color: "hsl(var(--destructive))" }}
//                         >
//                             Cancel / रद्द करें
//                         </button>
//                     </div>
//                 </div>
//             )}



//         </div>
//     );
// };

// export default DocumentUpload;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
    FileText,
    Car,
    Shield,
    Award,
    Check,
    Camera,
    Upload,
    Image
} from "lucide-react";

import StepIndicator from "@/components/StepIndicator";
import InfoBanner from "@/components/InfoBanner";
import AppHeader from "@/components/AppHeader";

const API = import.meta.env.VITE_API_BASE_URL;

const docTypes = [
    { key: "dl", label: "Driving License", labelHi: "ड्राइविंग लाइसेंस", icon: FileText },
    { key: "rc", label: "Vehicle RC", labelHi: "गाड़ी की आरसी", icon: Car },
    { key: "insurance", label: "Insurance", labelHi: "बीमा", icon: Shield },
    { key: "fitness", label: "Fitness Cert", labelHi: "फिटनेस प्रमाण पत्र", icon: Award },
];

const getSessionId = () => {
    let sessionId = localStorage.getItem("driver_session");
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("driver_session", sessionId);
    }
    return sessionId;
};

const DocumentUpload = () => {
    const navigate = useNavigate();

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    const [docs, setDocs] = useState({});
    const [showPicker, setShowPicker] = useState(null);
    const [currentDocKey, setCurrentDocKey] = useState(null);

    const sessionId = getSessionId();

    /* ========================= */
    /* OPEN PICKER */
    /* ========================= */

    const openPicker = (key) => {
        setCurrentDocKey(key);
        setShowPicker(true);
    };

    /* ========================= */
    /* TRIGGER INPUT */
    /* ========================= */

    const triggerFileInput = (type) => {
        if (type === "camera") {
            cameraInputRef.current?.click();
        }
        if (type === "gallery") {
            galleryInputRef.current?.click();
        }
        if (type === "pdf") {
            pdfInputRef.current?.click();
        }
    };

    /* ========================= */
    /* HANDLE FILE */
    /* ========================= */

    const handleFileSelect = async (file) => {
        if (!file || !currentDocKey) return;

        setShowPicker(null);

        setDocs((prev) => ({
            ...prev,
            [currentDocKey]: {
                preview:
                    file.type === "application/pdf"
                        ? null
                        : URL.createObjectURL(file),
                progress: 0,
                uploading: true,
                uploaded: false,
                file
            },
        }));

        const formData = new FormData();
        formData.append("sessionId", sessionId);
        formData.append("type", currentDocKey);
        formData.append("document", file);

        try {
            await axios.post(`${API}/api/driver/upload-doc`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    const percent = Math.round(
                        (event.loaded * 100) / event.total
                    );

                    setDocs((prev) => ({
                        ...prev,
                        [currentDocKey]: {
                            ...prev[currentDocKey],
                            progress: percent,
                        },
                    }));
                },
            });

            setDocs((prev) => ({
                ...prev,
                [currentDocKey]: {
                    ...prev[currentDocKey],
                    uploading: false,
                    uploaded: true,
                    progress: 100,
                },
            }));
        } catch (error) {
            alert(error.response?.data?.message || "Upload failed");

            setDocs((prev) => ({
                ...prev,
                [currentDocKey]: {
                    ...prev[currentDocKey],
                    uploading: false,
                },
            }));
        }
    };

    const onInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
        e.target.value = "";
    };

    const allUploaded = docTypes.every(
        (d) => docs[d.key]?.uploaded
    );

    return (
        <div className="mobile-container">
            <AppHeader />

            <div className="page-content">
                <StepIndicator
                    currentStep={2}
                    totalSteps={4}
                    label="Upload Documents"
                    labelHi="दस्तावेज़ अपलोड करें"
                />

                <InfoBanner
                    text="Tap below to upload"
                    textHi="अपलोड करने के लिए नीचे टैप करें"
                />

                {/* DOCUMENT GRID */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {docTypes.map((doc) => {
                        const state = docs[doc.key];
                        const Icon = doc.icon;

                        return (
                            <button
                                key={doc.key}
                                onClick={() => openPicker(doc.key)}
                                className="relative card-upload"
                            >
                                {state?.uploaded && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-success-foreground" />
                                    </div>
                                )}

                                {state?.preview ? (
                                    <img
                                        src={state.preview}
                                        alt="preview"
                                        className="w-full h-20 object-cover rounded-md mb-2"
                                    />
                                ) : (
                                    <Icon className="w-8 h-8 text-muted-foreground mb-2" />
                                )}

                                <span className="text-sm font-medium">
                                    {doc.label}
                                </span>

                                {state?.uploading && (
                                    <div className="w-full mt-2">
                                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{
                                                    width: `${state.progress}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            {state.progress}%
                                        </p>
                                    </div>
                                )}

                                {state?.file?.type === "application/pdf" && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PDF Selected
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="page-bottom">
                <button
                    onClick={() => navigate("/driver/selfie")}
                    disabled={!allUploaded}
                    className="btn-primary-full disabled:opacity-50"
                >
                    Next / आगे बढ़ें →
                </button>
            </div>

            {/* ========================= */}
            {/* SELECT OPTION SHEET */}
            {/* ========================= */}

            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "hsl(var(--foreground) / 0.4)" }}
                        onClick={() => setShowPicker(null)}
                    />

                    {/* SHEET */}
                    <div
                        className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl transition-all duration-300 animate-[slideUp_0.25s_ease-out]"
                        style={{ background: "hsl(var(--card))" }}
                    >
                        <h3
                            className="text-lg font-semibold text-center mb-1"
                            style={{ color: "hsl(var(--foreground))" }}
                        >
                            Select Option / विकल्प चुनें
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mt-5">

                            <button
                                onClick={() => triggerFileInput("camera")}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span className="text-xs">Take Photo</span>
                            </button>

                            <button
                                onClick={() => triggerFileInput("pdf")}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs">Upload PDF</span>
                            </button>

                            <button
                                onClick={() => triggerFileInput("gallery")}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
                                    <Image className="w-6 h-6" />
                                </div>
                                <span className="text-xs">Gallery</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowPicker(null)}
                            className="w-full text-center text-sm font-medium mt-6"
                            style={{ color: "hsl(var(--destructive))" }}
                        >
                            Cancel / रद्द करें
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={onInputChange}
                className="hidden"
            />

            <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={onInputChange}
                className="hidden"
            />

            <input
                type="file"
                accept="application/pdf"
                ref={pdfInputRef}
                onChange={onInputChange}
                className="hidden"
            />
        </div>
    );
};

export default DocumentUpload;