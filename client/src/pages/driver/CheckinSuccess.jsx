// import { CheckCircle } from "lucide-react";
// import AppHeader from "@/components/AppHeader";
// import { useLocation } from "react-router-dom";
// import usePageAudio from "@/hooks/usePageAudio";
// import { useEffect } from "react";

// const CheckinSuccess = () => {
//     const location = useLocation();
//     const data = location.state;

//     if (!data) {
//         return <div className="mobile-container">No data found</div>;
//     }
//     const [speak, audioEnabled, toggleAudio] = usePageAudio();
//     const details = [
//         { label: "ZGP", value: data.Zgp || "-" },
//         { label: "Vehicle / वाहन", value: data.Vehicle_No },
//         { label: "DO Number / डीओ नंबर", value: data.Do_No },
//         { label: "Driver", value: data.Driver_Name },
//         { label: "Mobile", value: data.Mobile },
//     ];
//     useEffect(() => {
//         if (data) {
//             const token = data.Token ?? data.Id;
//             let message = '';
//             if (token !== 0) {
//                 message = `रिपोर्टिंग सफल रही! आपका  वेटिंग नंबर ${token} है। कृपया गेट नंबर 1 पर जाएं।`;
//             } else {
//                 message = `namashkaarr !! कास्ता Plaantt  में आपका स्वागत है !!`
//             }

//             speak(message);
//         }

//     }, [data, speak, toggleAudio]);

//     return (
//         <div className="mobile-container">
//             <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

//             <div className="page-content flex flex-col items-center justify-center flex-1">

//                 <div
//                     className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
//                     style={{ background: "hsl(var(--success) / 0.15)" }}
//                 >
//                     <CheckCircle
//                         className="w-12 h-12"
//                         style={{ color: "hsl(var(--success))" }}
//                     />
//                 </div>

//                 <h1
//                     className="text-2xl font-bold"
//                     style={{ color: "hsl(var(--foreground))" }}
//                 >
//                     Reporting Successful!
//                 </h1>

//                 <p
//                     className="text-sm mb-6"
//                     style={{ color: "hsl(var(--muted-foreground))" }}
//                 >
//                     रिपोर्टिंग सफल रही!
//                 </p>

//                 <div
//                     className="rounded-2xl w-full overflow-hidden shadow-sm"
//                     style={{
//                         background: "hsl(var(--card))",
//                         border: "1px solid hsl(var(--border))",
//                     }}
//                 >
//                     <div
//                         className="px-6 py-5 text-center border-b"
//                         style={{
//                             background: "hsl(var(--primary) / 0.05)",
//                             borderColor: "hsl(var(--border))",
//                         }}
//                     >
//                         <div className="flex flex-col items-center">
//                             {/* <span
//                                 className="text-3xl font-semibold"
//                                 style={{ color: "hsl(var(--primary))" }}
//                             >
//                                 Token: #{data.Token ?? data.Id}
//                             </span> */}
//                             <span
//                                 className="text-5xl font-bold"
//                                 style={{ color: "hsl(var(--primary))" }}
//                             >
//                                 {/* #{data.Token ?? data.Id} */}
//                                 #{data.Token === 0 ? data.Status : (data.Token ?? data.Id)}
//                             </span>
//                             <p
//                                 className="text-sm mt-1"
//                                 style={{ color: "hsl(var(--muted-foreground))" }}
//                             >
//                                 Waiting Number / प्रतीक्षा क्रमांक
//                             </p>
//                         </div>
//                     </div>

//                     <div className="px-6 py-4 space-y-3">
//                         {details.map((item) => (
//                             <div key={item.label} className="flex justify-between">
//                                 <span
//                                     className="text-sm"
//                                     style={{ color: "hsl(var(--muted-foreground))" }}
//                                 >
//                                     {item.label}
//                                 </span>
//                                 <span
//                                     className="text-sm font-semibold"
//                                     style={{ color: "hsl(var(--foreground))" }}
//                                 >
//                                     {item.value}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div
//                     className="mt-6 rounded-xl px-5 py-3 text-center w-full"
//                     style={{
//                         background: "hsl(var(--success) / 0.1)",
//                         border: "1px solid hsl(var(--success) / 0.2)",
//                     }}
//                 >
//                     <p style={{ color: "hsl(var(--success))" }} className="font-semibold">
//                         Please go to Gate No. 1
//                     </p>
//                     <p
//                         className="text-xs"
//                         style={{ color: "hsl(var(--muted-foreground))" }}
//                     >
//                         कृपया गेट नंबर 1 पर जाएं
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CheckinSuccess;

import { CheckCircle } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useLocation, useNavigate } from "react-router-dom";
import usePageAudio from "@/hooks/usePageAudio";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const CheckinSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(location.state); // use navigation state initially
    const [speak, audioEnabled, toggleAudio] = usePageAudio();

    // ✅ On every load/refresh — re-fetch fresh data using Do_No
    useEffect(() => {
        const fetchFreshData = async () => {
            const doNo = location.state?.Do_No || data?.Do_No;
            if (!doNo) return;

            try {
                const res = await axios.get(`${API}/api/driver/validatePage/${doNo}`);
                const freshData = res.data.data;

                if (freshData.Status === "ReportIn" || freshData.Status === "CheckedIn") {
                    setData(freshData); // ✅ update with latest Token
                } else {
                    // Status changed to something else (CheckedOut etc.) → go back
                    navigate("/driver");
                }
            } catch (err) {
                // If not found, stay on page with existing state data
                console.error("Failed to fetch fresh data", err);
            }
        };

        fetchFreshData();
    }, []); // runs once on mount (covers refresh)

    useEffect(() => {
        if (data) {
            const token = data.Token ?? data.Id;
            let message = '';
            if (token !== 0) {
                message = `रिपोर्टिंग सफल रही! आपका वेटिंग नंबर ${token} है। कृपया गेट नंबर 1 पर जाएं।`;
            } else {
                message = `namashkaarr !! कास्ता Plaantt  में आपका स्वागत है !!`;
            }
            speak(message);
        }
    }, [data, speak, toggleAudio]);

    if (!data) {
        return <div className="mobile-container">No data found</div>;
    }

    const details = [
        { label: "ZGP", value: data.Zgp || "-" },
        { label: "Vehicle / वाहन", value: data.Vehicle_No },
        { label: "DO Number / डीओ नंबर", value: data.Do_No },
        { label: "Driver", value: data.Driver_Name },
        { label: "Mobile", value: data.Mobile },
    ];

    return (
        <div className="mobile-container">
            <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

            <div className="page-content flex flex-col items-center justify-center flex-1">

                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "hsl(var(--success) / 0.15)" }}
                >
                    <CheckCircle
                        className="w-12 h-12"
                        style={{ color: "hsl(var(--success))" }}
                    />
                </div>

                <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
                    Reporting Successful!
                </h1>
                <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                    रिपोर्टिंग सफल रही!
                </p>

                <div
                    className="rounded-2xl w-full overflow-hidden shadow-sm"
                    style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                >
                    <div
                        className="px-6 py-5 text-center border-b"
                        style={{ background: "hsl(var(--primary) / 0.05)", borderColor: "hsl(var(--border))" }}
                    >
                        <span className="text-5xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                            #{data.Token === 0 ? data.Status : (data.Token ?? data.Id)}
                        </span>
                        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                            Waiting Number / प्रतीक्षा क्रमांक
                        </p>
                    </div>

                    <div className="px-6 py-4 space-y-3">
                        {details.map((item) => (
                            <div key={item.label} className="flex justify-between">
                                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                                    {item.label}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="mt-6 rounded-xl px-5 py-3 text-center w-full"
                    style={{ background: "hsl(var(--success) / 0.1)", border: "1px solid hsl(var(--success) / 0.2)" }}
                >
                    <p style={{ color: "hsl(var(--success))" }} className="font-semibold">
                        Please go to Gate No. 1
                    </p>
                    <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        कृपया गेट नंबर 1 पर जाएं
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckinSuccess;
