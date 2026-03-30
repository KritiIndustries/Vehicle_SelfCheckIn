
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, RotateCcw } from "lucide-react";
import selfieExample from "@/assets/selfie-example.jpg"
import StepIndicator from "@/components/StepIndicator";
import AppHeader from "@/components/AppHeader";
import usePageAudio from "@/hooks/usePageAudio";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

const API = import.meta.env.VITE_API_BASE_URL;

const SelfieVerification = () => {

    const isMobileDevice = () =>
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [speak, audioEnabled, toggleAudio] = usePageAudio();

    const sessionId = localStorage.getItem("driver_session");
    let value = JSON.parse(sessionStorage.getItem("driverDetails"));

    /* ========================= */
    /* TIMER */
    /* ========================= */

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const instructionText = "कृपया अपना सेल्फी अपलोड करें। सुनिश्चित करें कि आप खाली ट्रक के साथ खड़े हैं।";
        speak(instructionText);
    }, [toggleAudio, speak]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    /* ========================= */
    /* OPEN CAMERA */
    /* ========================= */
    //TODO: in Mobile ancommnet this function and add capture="Driver" to input to directly open camera instead of file selector
    const openCamera = () => {
        if (!fileInputRef.current) return;

        if (isMobileDevice()) {
            fileInputRef.current.setAttribute("capture", "user");
        } else {
            fileInputRef.current.removeAttribute("capture");
        }

        fileInputRef.current.value = "";
        fileInputRef.current.click();
    };

    /* ========================= */
    /* HANDLE CAPTURE */
    /* ========================= */

    // const handleFileChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     try {
    //         setUploading(true);
    //         const ocrDetailsRaw = sessionStorage.getItem("ocrConfirmedData");
    //         const ocrDetails = ocrDetailsRaw ? JSON.parse(ocrDetailsRaw) : null;

    //         const vehicleNo =
    //             ocrDetails?.rc?.vehicleNo || "UNKNOWN_VEHICLE";
    //         setProgress(0);

    //         const previewUrl = URL.createObjectURL(file);
    //         setPreview(previewUrl);

    //         const formData = new FormData();
    //         formData.append("sessionId", sessionId);
    //         formData.append("doNumber", value?.doNumber);
    //         formData.append("vehicleNo", vehicleNo);

    //         formData.append("selfie", file);

    //         await axios.post(`${API}/api/driver/upload-selfie`, formData, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //             onUploadProgress: (progressEvent) => {
    //                 const percent = Math.round(
    //                     (progressEvent.loaded * 100) / progressEvent.total
    //                 );
    //                 setProgress(percent);
    //             },
    //         });

    //         setUploading(false);
    //         setUploaded(true);

    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Selfie upload failed");
    //         speak(error.response?.data?.message || "Selfie upload failed");
    //         setUploading(false);
    //     }
    // };


    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            speak("फ़ाइल का आकार 5MB से कम होना चाहिए");
            return;
        }

        // ✅ Validate file type
        const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/webp",
            "image/heic", "image/heif", "application/octet-stream"
        ];
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
            toast.error("Only image files allowed for selfie");
            speak("केवल इमेज फ़ाइल अपलोड करें");
            return;
        }

        let objectUrl = null;

        try {
            setUploading(true);
            setProgress(0);

            const ocrDetailsRaw = sessionStorage.getItem("ocrConfirmedData");
            const ocrDetails = ocrDetailsRaw ? JSON.parse(ocrDetailsRaw) : null;
            const vehicleNo = ocrDetails?.rc?.vehicleNo || "UNKNOWN_VEHICLE";

            // ✅ Create preview URL and track it for cleanup
            objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            const formData = new FormData();
            formData.append("sessionId", sessionId);
            formData.append("doNumber", value?.doNumber);
            formData.append("vehicleNo", vehicleNo);
            formData.append("selfie", file);

            // ✅ Retry logic
            let lastError = null;
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    await axios.post(`${API}/api/driver/upload-selfie`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                        timeout: 30000, // ✅ 30 second timeout
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setProgress(percent);
                        },
                    });

                    // ✅ Success
                    setUploaded(true);
                    return; // exit retry loop

                } catch (err) {
                    lastError = err;

                    const status = err.response?.status;

                    // ✅ Don't retry on client errors (4xx)
                    if (status && status >= 400 && status < 500) {
                        throw err;
                    }

                    // ✅ Retry on network/server errors
                    if (attempt < MAX_RETRIES) {
                        toast.warning(`Upload failed, retrying... (${attempt}/${MAX_RETRIES})`);
                        setProgress(0);
                        await sleep(RETRY_DELAY * attempt); // exponential backoff
                    }
                }
            }

            // All retries failed
            throw lastError;

        } catch (error) {
            // ✅ Cleanup preview on failure
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                setPreview(null);
            }
            setUploaded(false);

            // ✅ Specific error messages
            let message = "Selfie upload failed";

            if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
                message = "Network error — please check your connection";
                speak("नेटवर्क की समस्या है। कृपया अपना कनेक्शन जांचें।");
            } else if (error.response?.status === 413) {
                message = "File too large — please use a smaller image";
                speak("फ़ाइल बहुत बड़ी है। कृपया छोटी इमेज का उपयोग करें।");
            } else if (error.response?.status === 401) {
                message = "Session expired — please restart";
                speak("सेशन समाप्त हो गया। कृपया फिर से शुरू करें।");
            } else {
                message = error.response?.data?.message || message;
                speak(message);
            }

            toast.error(message);

        } finally {
            setUploading(false);
        }
    };
    /* ========================= */
    /* FINALIZE CHECKIN */
    /* ========================= */

    const finalizeCheckin = async () => {
        try {
            setUploading(true);
            const ocrDetailsRaw = sessionStorage.getItem("ocrConfirmedData");
            const ocrDetails = ocrDetailsRaw ? JSON.parse(ocrDetailsRaw) : null;

            const vehicleNo =
                ocrDetails?.rc?.vehicleNo || "UNKNOWN_VEHICLE";
            const driverName =
                ocrDetails?.dl?.name || "Driver";

            console.log("Finalize response received", sessionId, value);
            const response = await axios.post(`${API}/api/driver/finalize`, {
                sessionId,
                doNo: value?.doNumber || null,
                vehicleNo,
                driverName,
                mobile: value?.mobile || null,
                lrNumber: value?.lrNumber || null,
                documentDetails: ocrDetails,
            });
            localStorage.removeItem("driver_session");

            // Pass backend data to next screen
            navigate("/driver/success", {
                state: response.data.data
            });

        } catch (error) {
            toast.error(error.response?.data?.message || "Finalize failed");
            speak(error.response?.data?.message || "Finalize failed");
        }
        finally {
            setUploading(false);
        }
    };

    return (
        <div className="mobile-container">
            <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

            {/* TIMER BAR */}
            <div className="bg-warning/15 text-warning text-sm font-semibold px-5 py-2 text-center">
                ⏱ {String(mins).padStart(2, "0")}:
                {String(secs).padStart(2, "0")} • Complete in 5 mins / 5 मिनट में पूरा करें
            </div>

            <div className="page-content">
                <div className="mt-2 mb-4">
                    <StepIndicator
                        currentStep={3}
                        totalSteps={4}
                        label="Selfie Verification"
                        labelHi="सेल्फी सत्यापन"
                    />
                </div>

                {/* EXAMPLE IMAGE */}
                <div className="bg-muted rounded-2xl overflow-hidden mb-6">
                    <img
                        src={selfieExample}
                        alt="Selfie example"
                        className="w-full h-48 object-cover"
                    />
                    <div className="px-4 py-3 text-center">
                        <p className="text-sm font-medium text-foreground">
                            Stand with empty truck behind you.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            खाली ट्रक के साथ खड़े हों
                        </p>
                    </div>
                </div>

                {/* SELFIE PREVIEW */}
                {preview && (
                    <div className="mb-4">
                        <img
                            src={preview}
                            alt="Selfie Preview"
                            className="w-full h-48 object-cover rounded-xl"
                        />

                        {uploading && (
                            <div className="mt-2">
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 text-center">
                                    Uploading... {progress}%
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!preview ? (
                    <button
                        onClick={openCamera}
                        className="btn-outline-primary"
                    >
                        <Camera className="w-5 h-5" />
                        Take Selfie / सेल्फी लें
                    </button>
                ) : (
                    uploaded && (
                        <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                            <p className="text-success font-semibold">
                                ✓ Selfie uploaded successfully
                            </p>
                            <button
                                onClick={openCamera}
                                className="text-xs text-primary mt-2 flex items-center justify-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Retake
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="page-bottom">
                {
                    !uploading ? (<Button
                        onClick={finalizeCheckin}
                        disabled={!uploaded}
                        className="btn-primary-full disabled:opacity-50"
                    >
                        Submit / जमा करें
                    </Button>) : (
                        <Button
                            disabled={!uploaded}
                            className="btn-primary-full disabled:opacity-50"
                        >Uploading..
                            <Spinner className="mr-2" data-icon="inline-start" />

                        </Button>)
                }

            </div>

            {/* CAMERA INPUT */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default SelfieVerification;