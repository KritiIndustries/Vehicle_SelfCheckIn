import { useState, useRef, useEffect } from "react";
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
import usePageAudio from "@/hooks/usePageAudio";
import OCRProcessor from "@/components/OCRProcessor";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "sonner";

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
    const [speak, audioEnabled, toggleAudio] = usePageAudio();
    const [showOCR, setShowOCR] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [extractedData, setExtractedData] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    const sessionId = getSessionId();
    useEffect(() => {
        const welcomeText = "कृपया apne दस्तावेज़ अपलोड करें";
        speak(welcomeText);
    }, [speak, toggleAudio]);

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

        // For image files, show OCR processing
        if (file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            setCurrentImage(imageUrl);
            // setShowOCR(true);

            // Store file for later upload after OCR confirmation
            setDocs((prev) => ({
                ...prev,
                [currentDocKey]: {
                    preview: imageUrl,
                    progress: 0,
                    uploading: false,
                    uploaded: false,
                    file
                },
            }));
        } else {
            // For PDF files, upload directly without OCR
            await uploadAllDocuments(currentDocKey, file);
        }
    };

    // const uploadDocument = async (docKey, file) => {
    //     setDocs((prev) => ({
    //         ...prev,
    //         [docKey]: {
    //             preview: file.type === "application/pdf" ? null : URL.createObjectURL(file),
    //             progress: 0,
    //             uploading: true,
    //             uploaded: false,
    //             file
    //         },
    //     }));

    //     const formData = new FormData();
    //     formData.append("sessionId", sessionId);
    //     formData.append("type", docKey);
    //     formData.append("document", file);

    //     try {
    //         // await axios.post(`${API}/api/driver/upload-doc`, formData, {
    //         //     onUploadProgress: (event) => {
    //         //         const percent = Math.round(
    //         //             (event.loaded * 100) / event.total
    //         //         );

    //         //         setDocs((prev) => ({
    //         //             ...prev,
    //         //             [docKey]: {
    //         //                 ...prev[docKey],
    //         //                 progress: percent,
    //         //             },
    //         //         }));
    //         //     },
    //         // });

    //         await axios.post(`${API}/api/driver/upload-doc`, formData, {
    //             onUploadProgress: (event) => {
    //                 const percent = Math.round(
    //                     (event.loaded * 100) / event.total
    //                 );

    //                 setDocs((prev) => ({
    //                     ...prev,
    //                     [docKey]: {
    //                         ...prev[docKey],
    //                         progress: percent,
    //                     },
    //                 }));
    //             }
    //         });
    //         setDocs((prev) => ({
    //             ...prev,
    //             [docKey]: {
    //                 ...prev[docKey],
    //                 uploading: false,
    //                 uploaded: true,
    //                 progress: 100,
    //             },
    //         }));
    //     } catch (error) {
    //         alert(error.response?.data?.message || "Upload failed");

    //         setDocs((prev) => ({
    //             ...prev,
    //             [docKey]: {
    //                 ...prev[docKey],
    //                 uploading: false,
    //             },
    //         }));
    //     }
    // };


    const uploadAllDocuments = async () => {

        const requiredDocs = ["dl", "rc", "insurance", "fitness"];

        // check if all docs selected
        const missingDocs = requiredDocs.filter(d => !docs[d]?.file);

        if (missingDocs.length > 0) {
            toast.error("Please upload all required documents");
            return;
        }

        const formData = new FormData();
        formData.append("sessionId", sessionId);

        const types = [];

        requiredDocs.forEach((key) => {

            const doc = docs[key];

            formData.append("documents", doc.file);
            types.push(key);

        });

        formData.append("types", JSON.stringify(types));

        try {

            const res = await axios.post(
                `${API}/api/driver/upload-doc`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log(res.data);

            toast.success("All documents uploaded successfully");

            navigate("/driver/selfie");

        } catch (error) {

            console.error(error);

            toast.error(error.response?.data?.message || "Upload failed");

        }

    };
    const handleOCRComplete = (ocrData) => {
        // Store extracted data
        setExtractedData(prev => ({
            ...prev,
            [currentDocKey]: ocrData
        }));

        setShowOCR(false);

        // Now upload the file after OCR confirmation
        const docState = docs[currentDocKey];
        if (docState && docState.file) {
            uploadDocument(currentDocKey, docState.file);
        }
    };

    const handleOCRCancel = () => {
        setShowOCR(false);
        setCurrentImage(null);
        // Remove the temporary document state
        setDocs(prev => {
            const newDocs = { ...prev };
            delete newDocs[currentDocKey];
            return newDocs;
        });
    };

    const onInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
        e.target.value = "";
    };

    const handleNextClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmProceed = () => {
        setShowConfirmation(false);
        navigate("/driver/selfie");
    };

    const handleCancelProceed = () => {
        setShowConfirmation(false);
    };

    const allSelected = docTypes.every(d => docs[d.key]?.file);

    return (
        <div className="mobile-container">
            <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

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
                    onClick={uploadAllDocuments}
                    disabled={!allSelected}
                    className="btn-primary-full disabled:opacity-50"
                >
                    Next / आगे बढ़ें →
                </button>
            </div>

            {/* SELECT OPTION SHEET */}
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

            {/* OCR Processor Modal */}
            {/* {showOCR && (
                <OCRProcessor
                    image={currentImage}
                    // onOCRComplete={handleOCRComplete}
                    onCancel={handleOCRCancel}
                />
            )} */}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmation}
                onConfirm={handleConfirmProceed}
                onCancel={handleCancelProceed}
                title="Proceed to Selfie Verification"
                message="Are you sure you want to proceed to selfie verification? Please confirm your uploaded documents are correct."
                extractedData={Object.values(extractedData)[0]}
            />
        </div>
    );
};

export default DocumentUpload;
