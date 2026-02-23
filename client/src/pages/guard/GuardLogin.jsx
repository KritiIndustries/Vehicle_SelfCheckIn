import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const GuardLogin = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const handleSendOtp = () => {
        if (mobile.length === 10) setOtpSent(true);
    };

    const handleVerify = () => {
        if (otp.length === 4) navigate("/guard/dashboard");
    };

    return (
        <div className="mobile-container">
            <AppHeader showAudio={false} />
            <div className="page-content flex flex-col">
                <div className="flex-1">
                    <div className="mt-8 mb-8 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Guard Login</h1>
                        <p className="text-sm text-muted-foreground mt-1">गार्ड लॉगिन</p>
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
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                placeholder="Ex: 9876543210"
                                className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                disabled={otpSent}
                            />
                        </div>

                        {!otpSent ? (
                            <button onClick={handleSendOtp} disabled={mobile.length !== 10} className="btn-primary-full disabled:opacity-50">
                                Send OTP / OTP भेजें
                            </button>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Enter OTP / OTP दर्ज करें</label>
                                    <input
                                        type="tel"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Enter 4-digit OTP"
                                        className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-[0.5em]"
                                    />
                                </div>
                                <button onClick={handleVerify} disabled={otp.length !== 4} className="btn-primary-full disabled:opacity-50">
                                    Verify / सत्यापित करें
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardLogin;
