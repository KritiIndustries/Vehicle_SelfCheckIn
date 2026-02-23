import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import selfieExample from "@/assets/selfie-example.jpg";

const SelfieVerification = () => {
    const navigate = useNavigate();
    const [captured, setCaptured] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <div className="mobile-container">
            <AppHeader />
            <div className="bg-warning/15 text-warning text-sm font-semibold px-5 py-2 text-center">
                ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} • Complete in 5 mins / 5 मिनट में पूरा करें
            </div>
            <div className="page-content">
                <div className="mt-2 mb-4">
                    <StepIndicator currentStep={3} totalSteps={4} label="Selfie Verification" labelHi="सेल्फी सत्यापन" />
                </div>

                <div className="bg-muted rounded-2xl overflow-hidden mb-6">
                    <img src={selfieExample} alt="Selfie example" className="w-full h-48 object-cover" />
                    <div className="px-4 py-3 text-center">
                        <p className="text-sm font-medium text-foreground">Stand with empty truck behind you.</p>
                        <p className="text-xs text-muted-foreground">खाली ट्रक के साथ खड़े हों</p>
                    </div>
                </div>

                {!captured ? (
                    <button onClick={() => setCaptured(true)} className="btn-outline-primary">
                        <Camera className="w-5 h-5" />
                        Take Selfie / सेल्फी लें
                    </button>
                ) : (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                        <p className="text-success font-semibold">✓ Selfie captured successfully</p>
                        <p className="text-xs text-muted-foreground mt-1">सेल्फी सफलतापूर्वक ली गई</p>
                    </div>
                )}
            </div>

            <div className="page-bottom">
                <button
                    onClick={() => navigate("/driver/success")}
                    disabled={!captured}
                    className="btn-primary-full disabled:opacity-50"
                >
                    Submit / जमा करें
                </button>
            </div>
        </div>
    );
};

export default SelfieVerification;
