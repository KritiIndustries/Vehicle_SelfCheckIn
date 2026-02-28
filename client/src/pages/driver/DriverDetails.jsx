// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AppHeader from "@/components/AppHeader";
// import StepIndicator from "@/components/StepIndicator";
// import InfoBanner from "@/components/InfoBanner";

//     const DriverDetails = () => {
//         const navigate = useNavigate();
//         const [doNumber, setDoNumber] = useState("");
//         const [lrNumber, setLrNumber] = useState("");
//         const [mobile, setMobile] = useState("");
//         const [doValidated, setDoValidated] = useState(false);

//         const handleValidateDO = () => {
//             if (doNumber.length > 3) setDoValidated(true);
//         };

//         const handleNext = () => {
//             if (lrNumber && mobile) navigate("/driver/documents");
//         };

//         return (
//             <div className="mobile-container">
//                 <AppHeader />
//                 <InfoBanner
//                     text="Please increase your device volume for better audio"
//                     textHi="बेहतर ऑडियो अनुभव के लिए कृपया अपने डिवाइस की वॉल्यूम बढ़ाएं"
//                     variant="warning"
//                 />
//                 <div className="page-content">
//                     {!doValidated ? (
//                         <>
//                             <div className="mt-4 mb-6 text-center">
//                                 <h1 className="text-xl font-bold text-primary">Welcome to Kasta Plant</h1>
//                                 <p className="text-sm text-muted-foreground">कास्ता प्लांट में आपका स्वागत है</p>
//                             </div>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">
//                                         DO Number / डीओ नंबर
//                                     </label>
//                                     <input
//                                         value={doNumber}
//                                         onChange={(e) => setDoNumber(e.target.value)}
//                                         placeholder="Ex: DO-784512"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={handleValidateDO}
//                                     disabled={doNumber.length < 4}
//                                     className="btn-primary-full disabled:opacity-50"
//                                 >
//                                     Validate DO / डीओ सत्यापित करें
//                                 </button>
//                             </div>
//                         </>
//                     ) : (
//                         <>
//                             <div className="mt-2 mb-2">
//                                 <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-sm font-semibold mb-4">
//                                     DO #{doNumber}
//                                 </div>
//                                 <StepIndicator currentStep={1} totalSteps={4} label="Driver Details" labelHi="ड्राइवर विवरण" />
//                                 <p className="text-sm text-muted-foreground mt-1 mb-4">
//                                     Please enter your details to verify the trip<br />
//                                     यात्रा सत्यापित करने के लिए कृपया अपना विवरण दर्ज करें
//                                 </p>
//                             </div>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">
//                                         LR Number / LR नंबर
//                                     </label>
//                                     <input
//                                         value={lrNumber}
//                                         onChange={(e) => setLrNumber(e.target.value)}
//                                         placeholder="Ex: LR-12345678"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">
//                                         Mobile Number / मोबाइल नंबर
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         maxLength={10}
//                                         value={mobile}
//                                         onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
//                                         placeholder="Ex: 9876543210"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                                     />
//                                 </div>
//                             </div>
//                         </>
//                     )}
//                 </div>
//                 {doValidated && (

//                     <div className="page-bottom">
//                         <button
//                             onClick={handleNext}
//                             disabled={!lrNumber || !mobile}
//                             className="btn-primary-full disabled:opacity-50"
//                         >
//                             Next / आगे बढ़ें →
//                         </button>
//                     </div>
//                 )}
//             </div>
//         );
//     };

// export default DriverDetails;
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import InfoBanner from "@/components/InfoBanner";
import StepIndicator from "@/components/StepIndicator";

const DriverDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doValue = searchParams.get("DO");


    const [doNumber, setDoNumber] = useState(doValue || 0);
    const [lrNumber, setLrNumber] = useState("");
    const [mobile, setMobile] = useState("");
    const [doValidated, setDoValidated] = useState(true);

    const utteranceRef = useRef(null);

    /* ========================= */
    /* AUDIO FUNCTION */
    /* ========================= */

    const speak = (text) => {
        if (!text) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "hi-IN";
        utterance.rate = 1;
        utterance.pitch = 1;

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    };

    /* ========================= */
    /* AUTO AUDIO ON RENDER */
    /* ========================= */

    useEffect(() => {
        const welcomeText =
            "Kaasta Plant में आपका स्वागत है";

        speak(welcomeText);

        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    /* ========================= */
    /* AUDIO AFTER DO VALIDATED */
    /* ========================= */

    useEffect(() => {
        if (!doValidated) return;

        const instructionText =
            "कृपया अपना विवरण दर्ज करें";

        speak(instructionText);
    }, [doValidated]);

    /* ========================= */
    /* HANDLERS */
    /* ========================= */

    const handleValidateDO = () => {
        if (doNumber.length > 3) {
            setDoValidated(true);
        }
    };

    const handleNext = () => {
        if (!lrNumber || mobile.length !== 10) return;

        sessionStorage.setItem("driverDetails", JSON.stringify({
            doNumber,
            lrNumber,
            mobile
        }));

        navigate("/driver/documents");
    };

    const replayAudio = () => {
        if (!doValidated) {
            speak("Welcome to Kasta Plant. Kasta प्लांट में आपका स्वागत है");
        } else {
            speak(
                "कृपया अपना विवरण दर्ज करें"
            );
        }
    };

    return (
        <div className="mobile-container">
            <AppHeader onReplay={replayAudio} />

            <InfoBanner
                text="Please increase your device volume for better audio"
                textHi="बेहतर ऑडियो अनुभव के लिए कृपया अपने डिवाइस की वॉल्यूम बढ़ाएं"
                variant="warning"
            />
            <div className="page-content">
                <>
                    <div className="mt-2 mb-2">
                        <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-sm font-semibold mb-4">
                            DO #{doNumber}
                        </div>

                        <StepIndicator
                            currentStep={1}
                            totalSteps={4}
                            label="Driver Details"
                            labelHi="ड्राइवर विवरण"
                        />

                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Please enter your details to verification
                            <br />
                            यात्रा सत्यापित करने के लिए कृपया अपना विवरण दर्ज करें
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">
                                LR Number / LR नंबर
                            </label>

                            <input
                                value={lrNumber}
                                onChange={(e) => setLrNumber(e.target.value)}
                                maxLength={30}
                                placeholder="Ex: LR-12345678"
                                className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">
                                Mobile Number / मोबाइल नंबर
                            </label>

                            <input
                                type="tel"
                                min={10}
                                maxLength={10}
                                value={mobile}
                                onChange={(e) =>
                                    setMobile(e.target.value.replace(/\D/g, ""))
                                }
                                placeholder="Ex: 9876543210"
                                className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </>

            </div>

            {doValidated && (
                <div className="page-bottom">
                    <button
                        onClick={handleNext}
                        disabled={!lrNumber || !mobile}
                        className="btn-primary-full disabled:opacity-50"
                    >
                        Next / आगे बढ़ें →
                    </button>
                </div>
            )}
        </div>
    );
};

export default DriverDetails;
