import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw, Navigation } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import InfoBanner from "@/components/InfoBanner";

const LocationCheck = () => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [withinRange, setWithinRange] = useState(false);
    const [distance, setDistance] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
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

        speak(
            "आप अभी कास्ता प्लांट से 500 मीटर से अधिक दूरी पर हैं");

        return () => speechSynthesis.cancel();
    }, [audioEnabled]);

    const checkLocation = () => {
        setChecking(true);
        setTimeout(() => {
            const simDist = Math.random() > 0.5 ? 120 : 680;
            setDistance(simDist);
            setWithinRange(simDist <= 500);
            setChecking(false);
        }, 1500);
    };

    useEffect(() => {
        let cancelled = false;

        const checkLocation = async () => {
            try {
                setChecking(true);

                // Simulated async location fetch
                await new Promise(res => setTimeout(res, 1500));

                if (cancelled) return;

                const simDist = Math.random() > 0.5 ? 120 : 680;

                setDistance(simDist);
                setWithinRange(simDist <= 500);
            } finally {
                if (!cancelled) setChecking(false);
            }
        };

        checkLocation();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="mobile-container">
            <AppHeader
                audioEnabled={audioEnabled}
                onToggleAudio={toggleAudio}
            />
            <InfoBanner
                text="Please increase your device volume for better audio"
                textHi="बेहतर ऑडियो अनुभव के लिए कृपया अपने डिवाइस की वॉल्यूम बढ़ाएं"
                variant="warning"
            />
            <div className="page-content flex flex-col items-center justify-center flex-1">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: withinRange ? 'hsl(var(--success) / 0.12)' : 'hsl(var(--accent) / 0.12)' }}>
                    <MapPin className="w-9 h-9" style={{ color: withinRange ? 'hsl(var(--success))' : 'hsl(var(--accent))' }} />
                </div>

                {checking ? (
                    <>
                        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                        <h2 className="text-lg font-semibold text-foreground">Checking Location...</h2>
                        <p className="text-sm text-muted-foreground">स्थान की जाँच हो रही है...</p>
                    </>
                ) : withinRange ? (
                    <div className="text-center">
                        <div className="bg-success/10 border border-success/20 rounded-2xl px-6 py-6 mb-6">
                            <h2 className="text-lg font-bold text-success">Welcome to Kasta Plant</h2>
                            <p className="text-sm text-muted-foreground mt-1">कास्ता प्लांट में आपका स्वागत है</p>
                            <p className="text-xs text-muted-foreground mt-2">~{distance}m from plant</p>
                        </div>
                        <button onClick={() => navigate("/driver/d")} className="btn-primary-full">
                            Continue / आगे बढ़ें →
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="bg-destructive/5 border border-destructive/15 rounded-2xl px-6 py-6 mb-6">
                            <h2 className="text-lg font-semibold text-destructive">
                                You are currently more than 500 meters away from the Kasta Plant
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                आप वर्तमान में कास्ता प्लांट से 500 मीटर से अधिक दूरी पर हैं
                            </p>
                        </div>
                        <button onClick={checkLocation} className="btn-outline-primary mb-3">
                            <RefreshCw className="w-4 h-4" />
                            Refresh Location / स्थान रीफ्रेश करें
                        </button>
                        <button className="btn-primary-full">
                            <Navigation className="w-4 h-4" />
                            Start Navigation / नेविगेशन शुरू करें
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationCheck;
