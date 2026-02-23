// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Phone } from "lucide-react";
// import AppHeader from "@/components/AppHeader";

// const DriverLogin = () => {
//     const navigate = useNavigate();
//     const [mobile, setMobile] = useState("");
//     const [otp, setOtp] = useState("");
//     const [otpSent, setOtpSent] = useState(false);

//     const handleSendOtp = () => {
//         if (mobile.length === 10) setOtpSent(true);
//     };

//     const handleVerify = () => {
//         if (otp.length === 4) navigate("/driver/location");
//     };

//     return (
//         <div className="mobile-container">
//             <AppHeader />
//             <div className="page-content flex flex-col">
//                 <div className="flex-1">
//                     <div className="mt-8 mb-8 text-center">
//                         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <Phone className="w-7 h-7 text-primary" />
//                         </div>
//                         <h1 className="text-2xl font-bold text-foreground">Driver Login</h1>
//                         <p className="text-sm text-muted-foreground mt-1">ड्राइवर लॉगिन</p>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="text-sm font-medium text-foreground block mb-1.5">
//                                 Mobile Number / मोबाइल नंबर
//                             </label>
//                             <input
//                                 type="tel"
//                                 maxLength={10}
//                                 value={mobile}
//                                 onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
//                                 placeholder="Ex: 9876543210"
//                                 className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                                 disabled={otpSent}
//                             />
//                         </div>

//                         {!otpSent ? (
//                             <button
//                                 onClick={handleSendOtp}
//                                 disabled={mobile.length !== 10}
//                                 className="btn-primary-full disabled:opacity-50"
//                             >
//                                 Send OTP / OTP भेजें
//                             </button>
//                         ) : (
//                             <>
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">
//                                         Enter OTP / OTP दर्ज करें
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         maxLength={4}
//                                         value={otp}
//                                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                                         placeholder="Enter 4-digit OTP"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-[0.5em]"
//                                     />
//                                     <p className="text-xs text-muted-foreground mt-2 text-center">
//                                         OTP sent to +91 {mobile}
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={handleVerify}
//                                     disabled={otp.length !== 4}
//                                     className="btn-primary-full disabled:opacity-50"
//                                 >
//                                     Verify / सत्यापित करें
//                                 </button>
//                                 <button
//                                     onClick={() => { setOtpSent(false); setOtp(""); }}
//                                     className="w-full text-center text-sm text-accent font-medium"
//                                 >
//                                     Resend OTP / OTP दोबारा भेजें
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DriverLogin;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Phone } from "lucide-react";
// import AppHeader from "@/components/AppHeader";

// const DriverLogin = () => {
//     const navigate = useNavigate();

//     const [mobile, setMobile] = useState("");
//     const [otp, setOtp] = useState("");
//     const [otpSent, setOtpSent] = useState(false);

//     /* ===================== */
//     /* AUDIO FUNCTION */
//     /* ===================== */

//     const speak = (text) => {
//         if (!text) return;

//         speechSynthesis.cancel();

//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "hi-IN";
//         utterance.rate = 1;
//         utterance.pitch = 1;

//         speechSynthesis.speak(utterance);
//     };

//     /* ===================== */
//     /* AUTO AUDIO */
//     /* ===================== */

//     useEffect(() => {
//         if (!otpSent) {
//             speak(
//                 "लॉगिन के लिए कृपया मोबाइल नंबर दर्ज करें"
//             );
//         } else {
//             speak(
//                 "कृपया अपने मोबाइल नंबर पर भेजा गया ओटीपी दर्ज करें"
//             );
//         }

//         return () => {
//             speechSynthesis.cancel();
//         };
//     }, [otpSent]);

//     /* ===================== */
//     /* HANDLERS */
//     /* ===================== */

//     const handleSendOtp = () => {
//         if (mobile.length === 10) {
//             setOtpSent(true);
//         }
//     };

//     const handleVerify = () => {
//         if (otp.length === 4) {
//             navigate("/driver/location");
//         }
//     };

//     const replayAudio = () => {
//         if (!otpSent) {
//             speak(
//                 "Please enter mobile number for login. लॉगिन के लिए कृपया मोबाइल नंबर दर्ज करें"
//             );
//         } else {
//             speak(
//                 "Please enter the OTP sent to your mobile number. कृपया अपने मोबाइल नंबर पर भेजा गया ओटीपी दर्ज करें"
//             );
//         }
//     };

//     return (
//         <div className="mobile-container">
//             <AppHeader onReplay={replayAudio} />

//             <div className="page-content flex flex-col">
//                 <div className="flex-1">
//                     <div className="mt-8 mb-8 text-center">
//                         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <Phone className="w-7 h-7 text-primary" />
//                         </div>

//                         <h1 className="text-2xl font-bold text-foreground">
//                             Driver Login
//                         </h1>
//                         <p className="text-sm text-muted-foreground mt-1">
//                             ड्राइवर लॉगिन
//                         </p>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="text-sm font-medium text-foreground block mb-1.5">
//                                 Mobile Number / मोबाइल नंबर
//                             </label>

//                             <input
//                                 type="tel"
//                                 maxLength={10}
//                                 value={mobile}
//                                 onChange={(e) =>
//                                     setMobile(e.target.value.replace(/\D/g, ""))
//                                 }
//                                 placeholder="Ex: 9876543210"
//                                 className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                                 disabled={otpSent}
//                             />
//                         </div>

//                         {!otpSent ? (
//                             <button
//                                 onClick={handleSendOtp}
//                                 disabled={mobile.length !== 10}
//                                 className="btn-primary-full disabled:opacity-50"
//                             >
//                                 Send OTP / OTP भेजें
//                             </button>
//                         ) : (
//                             <>
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">
//                                         Enter OTP / OTP दर्ज करें
//                                     </label>

//                                     <input
//                                         type="tel"
//                                         maxLength={4}
//                                         value={otp}
//                                         onChange={(e) =>
//                                             setOtp(e.target.value.replace(/\D/g, ""))
//                                         }
//                                         placeholder="Enter 4-digit OTP"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-[0.5em]"
//                                     />

//                                     <p className="text-xs text-muted-foreground mt-2 text-center">
//                                         OTP sent to +91 {mobile}
//                                     </p>
//                                 </div>

//                                 <button
//                                     onClick={handleVerify}
//                                     disabled={otp.length !== 4}
//                                     className="btn-primary-full disabled:opacity-50"
//                                 >
//                                     Verify / सत्यापित करें
//                                 </button>

//                                 <button
//                                     onClick={() => {
//                                         setOtpSent(false);
//                                         setOtp("");
//                                     }}
//                                     className="w-full text-center text-sm text-accent font-medium"
//                                 >
//                                     Resend OTP / OTP दोबारा भेजें
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DriverLogin;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const DriverLogin = () => {
    const navigate = useNavigate();

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [audioEnabled, setAudioEnabled] = useState(true);

    /* ================= AUDIO ================= */

    const speak = (text) => {
        if (!audioEnabled) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "hi-IN";
        speechSynthesis.speak(utterance);
    };

    const toggleAudio = () => {
        if (audioEnabled) {
            speechSynthesis.cancel(); // stop immediately
        }
        setAudioEnabled((prev) => !prev);
    };

    /* ================= AUTO AUDIO ================= */

    useEffect(() => {
        if (!audioEnabled) return;

        if (!otpSent) {
            speak(
                "लॉगिन के लिए कृपया मोबाइल नंबर दर्ज करें"
            );
        } else {
            speak(
                "कृपया अपने मोबाइल नंबर पर भेजा गया ओटीपी दर्ज करें"
            );
        }

        return () => speechSynthesis.cancel();
    }, [otpSent, audioEnabled]);

    /* ================= HANDLERS ================= */

    const handleSendOtp = () => {
        if (mobile.length === 10) setOtpSent(true);
    };

    const handleVerify = () => {
        if (otp.length === 4) navigate("/driver/location");
    };

    return (
        <div className="mobile-container">
            <AppHeader
                audioEnabled={audioEnabled}
                onToggleAudio={toggleAudio}
            />

            <div className="page-content flex flex-col">
                <div className="flex-1">
                    <div className="mt-8 mb-8 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-7 h-7 text-primary" />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground">
                            Driver Login
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            ड्राइवर लॉगिन
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">
                                Mobile Number / मोबाइल नंबर
                            </label>

                            <input
                                type="tel"
                                maxLength={10}
                                value={mobile}
                                onChange={(e) =>
                                    setMobile(e.target.value.replace(/\D/g, ""))
                                }
                                placeholder="Ex: 9876543210"
                                className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                disabled={otpSent}
                            />
                        </div>

                        {!otpSent ? (
                            <button
                                onClick={handleSendOtp}
                                disabled={mobile.length !== 10}
                                className="btn-primary-full disabled:opacity-50"
                            >
                                Send OTP / OTP भेजें
                            </button>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">
                                        Enter OTP / OTP दर्ज करें
                                    </label>

                                    <input
                                        type="tel"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value.replace(/\D/g, ""))
                                        }
                                        placeholder="Enter 4-digit OTP"
                                        className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-[0.5em]"
                                    />

                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        OTP sent to +91 {mobile}
                                    </p>
                                </div>

                                <button
                                    onClick={handleVerify}
                                    disabled={otp.length !== 4}
                                    className="btn-primary-full disabled:opacity-50"
                                >
                                    Verify / सत्यापित करें
                                </button>

                                <button
                                    onClick={() => {
                                        setOtpSent(false);
                                        setOtp("");
                                    }}
                                    className="w-full text-center text-sm text-accent font-medium"
                                >
                                    Resend OTP / OTP दोबारा भेजें
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverLogin;
