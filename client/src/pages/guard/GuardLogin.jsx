// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Shield } from "lucide-react";
// import AppHeader from "@/components/AppHeader";

// const GuardLogin = () => {
//     const navigate = useNavigate();
//     const [mobile, setMobile] = useState("");
//     const [otp, setOtp] = useState("");
//     const [otpSent, setOtpSent] = useState(false);

//     const handleSendOtp = () => {
//         if (mobile.length === 10) setOtpSent(true);
//     };

//     const handleVerify = () => {
//         if (otp.length === 4) navigate("/guard/dashboard");
//     };

//     return (
//         <div className="mobile-container">
//             <AppHeader showAudio={false} />
//             <div className="page-content flex flex-col">
//                 <div className="flex-1">
//                     <div className="mt-8 mb-8 text-center">
//                         <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <Shield className="w-7 h-7 text-primary" />
//                         </div>
//                         <h1 className="text-2xl font-bold text-foreground">Guard Login</h1>
//                         <p className="text-sm text-muted-foreground mt-1">गार्ड लॉगिन</p>
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
//                             <button onClick={handleSendOtp} disabled={mobile.length !== 10} className="btn-primary-full disabled:opacity-50">
//                                 Send OTP / OTP भेजें
//                             </button>
//                         ) : (
//                             <>
//                                 <div>
//                                     <label className="text-sm font-medium text-foreground block mb-1.5">Enter OTP / OTP दर्ज करें</label>
//                                     <input
//                                         type="tel"
//                                         maxLength={4}
//                                         value={otp}
//                                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                                         placeholder="Enter 4-digit OTP"
//                                         className="w-full px-4 py-3 border border-input rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-2xl tracking-[0.5em]"
//                                     />
//                                 </div>
//                                 <button onClick={handleVerify} disabled={otp.length !== 4} className="btn-primary-full disabled:opacity-50">
//                                     Verify / सत्यापित करें
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GuardLogin;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import axios from "axios";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const API = import.meta.env.VITE_API_BASE_URL;

const GuardLogin = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    // 🔹 Send OTP API
    const handleSendOtp = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.post(`${API}/api/auth/send-otp`, {
                phone: mobile
            });

            if (response.data.success) {
                setOtpSent(true);
                toast.success("OTP sent successfully");
            }
        } catch (err) {
            // setError(err.response?.data?.message || "Failed to send OTP");
            toast.error(error.response?.data?.message || "Failed to send OTP....");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Verify OTP API
    const handleVerify = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.post(`${API}/api/auth/verify-otp`, {
                phone: mobile,
                otp: otp
            });

            if (response.data.success) {
                const token = response.data.data.token;

                // Store token
                localStorage.setItem("guardToken", token);

                navigate("/guard/dashboard");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
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
                            <label className="text-sm font-medium block mb-1.5">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                maxLength={10}
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                placeholder="9876543210"
                                className="w-full px-4 py-3 border rounded-xl"
                                disabled={otpSent}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        {!otpSent ? (
                            <button
                                onClick={handleSendOtp}
                                disabled={mobile.length !== 10 || loading}
                                className="btn-primary-full"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium block mb-1.5">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        placeholder="1234"
                                        className="w-full px-4 py-3 border rounded-xl text-center text-2xl tracking-[0.5em]"
                                    />
                                </div>

                                <button
                                    onClick={handleVerify}
                                    disabled={otp.length !== 4 || loading}
                                    className="btn-primary-full"
                                >
                                    {loading ? "Verifying..." : "Verify"}
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
