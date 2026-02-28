// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Camera } from "lucide-react";
// import AppHeader from "@/components/AppHeader";
// import StepIndicator from "@/components/StepIndicator";
// import selfieExample from "@/assets/selfie-example.jpg";

// const SelfieVerification = () => {
//     const navigate = useNavigate();
//     const [captured, setCaptured] = useState(false);
//     const [timeLeft, setTimeLeft] = useState(300);

//     useEffect(() => {
//         const timer = setInterval(() => {
//             setTimeLeft((t) => (t > 0 ? t - 1 : 0));
//         }, 1000);
//         return () => clearInterval(timer);
//     }, []);

//     const mins = Math.floor(timeLeft / 60);
//     const secs = timeLeft % 60;

//     return (
//         <div className="mobile-container">
//             <AppHeader />
//             <div className="bg-warning/15 text-warning text-sm font-semibold px-5 py-2 text-center">
//                 ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} • Complete in 5 mins / 5 मिनट में पूरा करें
//             </div>
//             <div className="page-content">
//                 <div className="mt-2 mb-4">
//                     <StepIndicator currentStep={3} totalSteps={4} label="Selfie Verification" labelHi="सेल्फी सत्यापन" />
//                 </div>

//                 <div className="bg-muted rounded-2xl overflow-hidden mb-6">
//                     <img src={selfieExample} alt="Selfie example" className="w-full h-48 object-cover" />
//                     <div className="px-4 py-3 text-center">
//                         <p className="text-sm font-medium text-foreground">Stand with empty truck behind you.</p>
//                         <p className="text-xs text-muted-foreground">खाली ट्रक के साथ खड़े हों</p>
//                     </div>
//                 </div>

//                 {!captured ? (
//                     <button onClick={() => setCaptured(true)} className="btn-outline-primary">
//                         <Camera className="w-5 h-5" />
//                         Take Selfie / सेल्फी लें
//                     </button>
//                 ) : (
//                     <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
//                         <p className="text-success font-semibold">✓ Selfie captured successfully</p>
//                         <p className="text-xs text-muted-foreground mt-1">सेल्फी सफलतापूर्वक ली गई</p>
//                     </div>
//                 )}
//             </div>

//             <div className="page-bottom">
//                 <button
//                     onClick={() => navigate("/driver/success")}
//                     disabled={!captured}
//                     className="btn-primary-full disabled:opacity-50"
//                 >
//                     Submit / जमा करें
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default SelfieVerification;


// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Camera, RotateCcw } from "lucide-react";
// import axios from "axios";
// import AppHeader from "@/components/AppHeader";
// import StepIndicator from "@/components/StepIndicator";
// import selfieExample from "@/assets/selfie-example.jpg";
// import { getCurrentLocation } from "@/services/location.service";
// import {
//     compressImage,
//     addWatermark,
//     validateCameraCapture
// } from "@/services/image.service";
// import { uploadWithProgress } from "@/services/upload.service";

// const API = import.meta.env.VITE_API_BASE_URL;

// const SelfieVerification = () => {
//     const isMobileDevice = () =>
//         /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);

//     const [preview, setPreview] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [uploaded, setUploaded] = useState(false);
//     const [progress, setProgress] = useState(0);
//     const [timeLeft, setTimeLeft] = useState(300);

//     /* ========================= */
//     /* TIMER */
//     /* ========================= */

//     useEffect(() => {
//         const timer = setInterval(() => {
//             setTimeLeft((t) => (t > 0 ? t - 1 : 0));
//         }, 1000);
//         return () => clearInterval(timer);
//     }, []);

//     const mins = Math.floor(timeLeft / 60);
//     const secs = timeLeft % 60;

//     /* ========================= */
//     /* OPEN CAMERA */
//     /* ========================= */

//     //TODO: in Mobile ancommnet this function and add capture="Driver" to input to directly open camera instead of file selector
//     // const openCamera = () => {
//     //     if (!fileInputRef.current) return;
//     //     fileInputRef.current.click();
//     // };
//     const openCamera = () => {
//         if (!fileInputRef.current) return;

//         if (isMobileDevice()) {
//             // Mobile → open camera directly
//             fileInputRef.current.setAttribute("capture", "user");
//         } else {
//             // Desktop → allow file upload
//             fileInputRef.current.removeAttribute("capture");
//         }

//         fileInputRef.current.click();
//     };

//     /* ========================= */
//     /* HANDLE CAPTURE */
//     /* ========================= */

//     const handleFileChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             if (isMobileDevice()) {
//                 validateCameraCapture(fileInputRef, file);
//             }

//             setUploading(true);

//             const location = await getCurrentLocation();
//             const compressed = await compressImage(file);
//             const finalImage = await addWatermark(compressed, location);

//             const formData = new FormData();
//             formData.append("selfie", finalImage);
//             formData.append("latitude", location.lat);
//             formData.append("longitude", location.lng);

//             // await uploadWithProgress(
//             //     "/api/driver/upload-selfie",
//             //     formData,
//             //     setProgress
//             // );

//             setUploaded(true);
//             setUploading(false);

//         } catch (error) {
//             alert(error.message);
//             setUploading(false);
//         }
//     };

//     /* ========================= */
//     /* UPLOAD SELFIE */
//     /* ========================= */

//     const uploadSelfie = async (file, location) => {
//         const formData = new FormData();
//         formData.append("selfie", file);
//         formData.append("latitude", location.lat);
//         formData.append("longitude", location.lng);

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
//     };

//     return (
//         <div className="mobile-container">
//             <AppHeader />

//             {/* TIMER BAR */}
//             <div className="bg-warning/15 text-warning text-sm font-semibold px-5 py-2 text-center">
//                 ⏱ {String(mins).padStart(2, "0")}:
//                 {String(secs).padStart(2, "0")} • Complete in 5 mins / 5 मिनट में पूरा करें
//             </div>

//             <div className="page-content">
//                 <div className="mt-2 mb-4">
//                     <StepIndicator
//                         currentStep={3}
//                         totalSteps={4}
//                         label="Selfie Verification"
//                         labelHi="सेल्फी सत्यापन"
//                     />
//                 </div>

//                 {/* EXAMPLE IMAGE */}
//                 <div className="bg-muted rounded-2xl overflow-hidden mb-6">
//                     <img
//                         src={selfieExample}
//                         alt="Selfie example"
//                         className="w-full h-48 object-cover"
//                     />
//                     <div className="px-4 py-3 text-center">
//                         <p className="text-sm font-medium text-foreground">
//                             Stand with empty truck behind you.
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                             खाली ट्रक के साथ खड़े हों
//                         </p>
//                     </div>
//                 </div>

//                 {/* SELFIE PREVIEW */}
//                 {preview && (
//                     <div className="mb-4">
//                         <img
//                             src={preview}
//                             alt="Selfie Preview"
//                             className="w-full h-48 object-cover rounded-xl"
//                         />

//                         {uploading && (
//                             <div className="mt-2">
//                                 <div className="h-1 bg-muted rounded-full overflow-hidden">
//                                     <div
//                                         className="h-full bg-primary transition-all"
//                                         style={{ width: `${progress}%` }}
//                                     />
//                                 </div>
//                                 <p className="text-xs text-muted-foreground mt-1 text-center">
//                                     Uploading... {progress}%
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {!preview ? (
//                     <button
//                         onClick={openCamera}
//                         className="btn-outline-primary"
//                     >
//                         <Camera className="w-5 h-5" />
//                         Take Selfie / सेल्फी लें
//                     </button>
//                 ) : (
//                     uploaded && (
//                         <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
//                             <p className="text-success font-semibold">
//                                 ✓ Selfie uploaded successfully
//                             </p>
//                             <button
//                                 onClick={openCamera}
//                                 className="text-xs text-primary mt-2 flex items-center justify-center gap-1"
//                             >
//                                 <RotateCcw className="w-3 h-3" />
//                                 Retake
//                             </button>
//                         </div>
//                     )
//                 )}
//             </div>

//             {/* SUBMIT BUTTON */}
//             <div className="page-bottom">
//                 <button
//                     onClick={() => navigate("/driver/success")}
//                     // disabled={!uploaded}
//                     className="btn-primary-full disabled:opacity-50"
//                 >
//                     Submit / जमा करें
//                 </button>
//             </div>

//             {/* CAMERA INPUT */}
//             <input
//                 type="file"
//                 accept="image/*"
//                 // capture="user"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 className="hidden"
//             />
//         </div>
//     );
// };

// export default SelfieVerification;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, RotateCcw } from "lucide-react";
import selfieExample from "@/assets/selfie-example.jpg"
import StepIndicator from "@/components/StepIndicator";
import AppHeader from "@/components/AppHeader";

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

    const sessionId = localStorage.getItem("driver_session");

    /* ========================= */
    /* TIMER */
    /* ========================= */

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    /* ========================= */
    /* OPEN CAMERA */
    /* ========================= */

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setProgress(0);

            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            const formData = new FormData();
            formData.append("sessionId", sessionId);
            formData.append("selfie", file);

            await axios.post(`${API}/api/driver/upload-selfie`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percent);
                },
            });

            setUploading(false);
            setUploaded(true);

        } catch (error) {
            alert(error.response?.data?.message || "Selfie upload failed");
            setUploading(false);
        }
    };

    /* ========================= */
    /* FINALIZE CHECKIN */
    /* ========================= */

    const finalizeCheckin = async () => {
        try {
            let value = JSON.parse(sessionStorage.getItem("driverDetails"));
            console.log("Finalize response received", sessionId, value);
            await axios.post(`${API}/api/driver/finalize`, {
                sessionId,
                doNo: value?.doNumber || null,
                vehicleNo: "MP09AB1235",
                driverName: "Test Driver1",
                mobile: value?.mobile || null
            });


            localStorage.removeItem("driver_session");

            navigate("/driver/success");

        } catch (error) {
            alert(error.response?.data?.message || "Finalize failed");
        }
    };

    return (
        <div className="mobile-container">
            <AppHeader />

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
                <button
                    onClick={finalizeCheckin}
                    disabled={!uploaded}
                    className="btn-primary-full disabled:opacity-50"
                >
                    Submit / जमा करें
                </button>
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