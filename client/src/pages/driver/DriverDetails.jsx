
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import InfoBanner from "@/components/InfoBanner";
import StepIndicator from "@/components/StepIndicator";
import { toast } from "sonner";
import usePageAudio from "@/hooks/usePageAudio";

const DriverDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doValue = searchParams.get("DO");
    const [doNumber, setDoNumber] = useState(doValue || 0);
    const [lrNumber, setLrNumber] = useState("");
    const [mobile, setMobile] = useState("");
    const [doValidated, setDoValidated] = useState(true);

    const [speak, audioEnabled, toggleAudio] = usePageAudio();

    /* ========================= */
    /* AUTO AUDIO ON RENDER */
    /* ========================= */

    useEffect(() => {
        const welcomeText = "Kaasta Plant में आपका स्वागत है कृपया अपना विवरण दर्ज करें";
        speak(welcomeText);
    }, [speak]);

    /* ========================= */
    /* AUDIO AFTER DO VALIDATED */
    /* ========================= */

    useEffect(() => {
        if (!doValue) {
            toast.error("कृपया डीलर से लिंक प्राप्त करें।.");
            speak("कृपया डीलर से लिंक प्राप्त करें");
            return;
        }

        const instructionText = "कृपया अपना विवरण दर्ज करें";
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
        if (!doValue) {
            toast.error("कृपया डीलर से लिंक प्राप्त करें।.");
            speak("कृपया डीलर से लिंक प्राप्त करें");
            return;
        }
        navigate("/driver/documents", {
            state: {
                doNumber,
                lrNumber,
                mobile
            }
        });
    };

    const replayAudio = () => {
        if (!doValidated) {
            speak("Welcome to Kasta Plant. Kasta प्लांट में आपका स्वागत है");
        } else {
            speak("कृपया अपना विवरण दर्ज करें");
        }
    };

    return (
        <div className="mobile-container">
            <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

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
