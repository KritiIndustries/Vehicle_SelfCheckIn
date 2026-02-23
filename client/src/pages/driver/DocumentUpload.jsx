import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Car, Shield, Award, Check, Camera, Upload, Image, X } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import InfoBanner from "@/components/InfoBanner";

const docTypes = [
    { key: "dl", label: "Driving License", labelHi: "ड्राइविंग लाइसेंस", icon: FileText },
    { key: "rc", label: "Vehicle RC", labelHi: "गाड़ी की आरसी", icon: Car },
    { key: "insurance", label: "Insurance", labelHi: "बीमा", icon: Shield },
    { key: "fitness", label: "Fitness Cert", labelHi: "फिटनेस प्रमाण पत्र", icon: Award },
];

const DocumentUpload = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState({
        dl: { uploaded: false },
        rc: { uploaded: false },
        insurance: { uploaded: false },
        fitness: { uploaded: false },
    });
    const [showPicker, setShowPicker] = useState(null);

    const handleUpload = (key) => {
        setShowPicker(key);
    };

    const simulateUpload = (key) => {
        setDocs((prev) => ({
            ...prev,
            [key]: { uploaded: true, name: `${key}_document.jpg` },
        }));
        setShowPicker(null);
    };

    const allUploaded = Object.values(docs).every((d) => d.uploaded);

    return (
        <div className="mobile-container">
            <AppHeader />
            <div className="page-content">
                <div className="mt-2 mb-2">
                    <StepIndicator currentStep={2} totalSteps={4} label="Upload Documents" labelHi="दस्तावेज़ अपलोड करें" />
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Please upload the following valid documents.<br />
                        कृपया निम्नलिखित वैध दस्तावेज़ अपलोड करें
                    </p>
                </div>

                <InfoBanner text="Tap below to upload" textHi="अपलोड करने के लिए नीचे टैप करें" />

                <div className="grid grid-cols-2 gap-3 mt-4">
                    {docTypes.map((doc) => {
                        const state = docs[doc.key];
                        const Icon = doc.icon;
                        return (
                            <button
                                key={doc.key}
                                onClick={() => !state.uploaded && handleUpload(doc.key)}
                                className={state.uploaded ? "card-upload-done" : "card-upload"}
                            >
                                {state.uploaded && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-success-foreground" />
                                    </div>
                                )}
                                <Icon className={`w-8 h-8 ${state.uploaded ? "text-success" : "text-muted-foreground"}`} />
                                <span className="text-sm font-medium text-foreground">{doc.label}</span>
                                <span className="text-xs text-muted-foreground">{doc.labelHi}</span>
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
                        style={{
                            background: "hsl(var(--card))",
                        }}
                    >
                        <h3
                            className="text-lg font-semibold text-center mb-1"
                            style={{ color: "hsl(var(--foreground))" }}
                        >
                            Select Option / विकल्प चुनें
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mt-5">
                            <button
                                onClick={() => simulateUpload(showPicker)}
                                className="flex flex-col items-center gap-2"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{ background: "hsl(var(--muted))" }}
                                >
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
                                    Take Photo
                                </span>
                                <span
                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                    className="text-xs"
                                >
                                    फोटो ले
                                </span>
                            </button>

                            <button
                                onClick={() => simulateUpload(showPicker)}
                                className="flex flex-col items-center gap-2"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{ background: "hsl(var(--muted))" }}
                                >
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
                                    Upload PDF
                                </span>
                                <span
                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                    className="text-xs"
                                >
                                    पीडीएफ अपलोड
                                </span>
                            </button>

                            <button
                                onClick={() => simulateUpload(showPicker)}
                                className="flex flex-col items-center gap-2"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{ background: "hsl(var(--muted))" }}
                                >
                                    <Image className="w-6 h-6" />
                                </div>
                                <span style={{ color: "hsl(var(--foreground))" }} className="text-xs">
                                    Gallery
                                </span>
                                <span
                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                    className="text-xs"
                                >
                                    गैलरी
                                </span>
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
        </div>
    );
};

export default DocumentUpload;
