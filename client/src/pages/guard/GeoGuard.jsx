// import { useEffect, useState } from "react";
// import { calculateDistanceMeters } from "@/services/geofence.service";
// import LocationCheck from "../driver/LocationCheck";
// import { MapPin } from "lucide-react";

// const plantLat = parseFloat(import.meta.env.VITE_PLANT_LAT);
// const plantLng = parseFloat(import.meta.env.VITE_PLANT_LNG);
// const radius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS);

// const GeoGuard = ({ children }) => {
//     const [status, setStatus] = useState("checking"); // checking | allowed | denied
//     const [withinRange, setWithinRange] = useState(false);

//     useEffect(() => {
//         const verifyLocation = async () => {
//             if (!navigator.geolocation) {
//                 setStatus("denied");
//                 return;
//             }

//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const userLat = position.coords.latitude;
//                     const userLng = position.coords.longitude;

//                     const distance = calculateDistanceMeters(
//                         plantLat,
//                         plantLng,
//                         userLat,
//                         userLng
//                     );

// if (distance <= radius) {
//     setStatus("allowed");
//     setWithinRange(true);
// } else {
//     setStatus("denied");
//     setWithinRange(false);
// }
//                 },
//                 () => setStatus("denied"),
//                 {
//                     enableHighAccuracy: true,
//                     timeout: 10000,
//                 }
//             );
//         };

//         verifyLocation();
//     }, []);

// if (status === "checking") {
//     return (
//         <div className="mobile-container flex items-center justify-center h-screen">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
//                 style={{ background: withinRange ? 'hsl(var(--success) / 0.12)' : 'hsl(var(--accent) / 0.12)' }}>
//                 <MapPin className="w-9 h-9" style={{ color: withinRange ? 'hsl(var(--success))' : 'hsl(var(--accent))' }} />
//             </div>
//             <>
//                 <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-4" />
//                 <h2 className="text-lg font-semibold text-foreground">Checking Location...</h2>
//                 <p className="text-sm text-muted-foreground">स्थान की जाँच हो रही है...</p>
//             </>
//         </div>
//     );
// }

// if (status === "denied") {
//     return (
//         <div className="mobile-container flex items-center justify-center h-screen text-center p-6">
//             <div>
//                 <h2 className="text-xl font-bold text-destructive">
//                     Access Restricted
//                 </h2>
//                 <p className="text-sm text-muted-foreground mt-2">
//                     <div className="bg-destructive/5 border border-destructive/15 rounded-2xl px-6 py-6 mb-6">
//                         <h2 className="text-lg font-semibold text-destructive">
//                             You are currently more than 500 meters away from the Kasta Plant
//                         </h2>
//                         <p className="text-sm text-muted-foreground mt-2">
//                             आप अभी में कास्ता प्लांट से {radius} मीटर से अधिक दूरी पर हैं
//                         </p>
//                     </div>
//                 </p>
//             </div>
//             <div>
//                 <button> Ref</button>
//             </div>
//         </div>

//     );
// }

//     return children;
// };

// export default GeoGuard;

import { useEffect, useState } from "react";
import { calculateDistanceMeters } from "@/services/geofence.service";
import { MapPin } from "lucide-react";
import usePageAudio from "@/hooks/usePageAudio";
import AppHeader from "@/components/AppHeader";

const plantLat = parseFloat(import.meta.env.VITE_PLANT_LAT);
const plantLng = parseFloat(import.meta.env.VITE_PLANT_LNG);
const radius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS);

const GeoGuard = ({ children }) => {
    const [status, setStatus] = useState("checking");
    const [withinRange, setWithinRange] = useState(false);
    const [speak, audioEnabled, toggleAudio] = usePageAudio();
    // checking | allowed | denied | permission-denied | no-geolocation

    const verifyLocation = async () => {
        if (!navigator.geolocation) {
            setStatus("no-geolocation");
            return;
        }

        if (navigator.permissions && navigator.permissions.query) {
            try {
                const perm = await navigator.permissions.query({ name: "geolocation" });

                if (perm.state === "denied") {
                    setStatus("permission-denied");
                    speak('कृपया इस साइट के लिए अपने ब्राउज़र या डिवाइस सेटिंग्स में location Permissions सक्षम करें।')
                    return;
                }
            } catch (e) { }
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const distance = calculateDistanceMeters(
                    plantLat,
                    plantLng,
                    userLat,
                    userLng
                );

                // if (distance <= radius) {
                //     setStatus("allowed");
                // } else {
                //     setStatus("denied");
                // }
                if (distance <= radius) {
                    setStatus("allowed");
                    setWithinRange(true);
                } else {
                    setStatus("denied");
                    speak('आप अभी में कास्ता प्लांट से 500 मीटर से अधिक दूरी पर हैं')
                    setWithinRange(false);
                }
            },
            (error) => {
                if (error && error.code === 1) {
                    setStatus("permission-denied");
                    speak(' कृपया इस साइट के लिए अपने ब्राउज़र या डिवाइस सेटिंग्स में स्थान अनुमति सक्षम करें।')
                } else {
                    setStatus("denied");
                    speak('आप अभी में कास्ता प्लांट से 500 मीटर से अधिक दूरी पर हैं')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    };

    useEffect(() => {
        verifyLocation();
    }, []);

    /* ---------------- CHECKING ---------------- */

    if (status === "checking") {
        return (
            <div className="mobile-container flex items-center justify-center h-screen">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: withinRange ? 'hsl(var(--success) / 0.12)' : 'hsl(var(--accent) / 0.12)' }}>
                    <MapPin className="w-9 h-9" style={{ color: withinRange ? 'hsl(var(--success))' : 'hsl(var(--accent))' }} />
                </div>
                <>
                    <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-lg font-semibold text-foreground">Checking Location...</h2>
                    <p className="text-sm text-muted-foreground">स्थान की जाँच हो रही है...{speak('स्थान की जाँच हो रही है...')}</p>
                </>
            </div>
        );
    }

    /* ---------------- PERMISSION DENIED ---------------- */

    if (status === "permission-denied") {
        return (
            <div className="mobile-container flex items-center justify-center h-screen text-center p-6">

                <div>
                    <h2 className="text-xl font-bold text-destructive">
                        Location Permission Required
                    </h2>

                    <div className="bg-destructive/5 border border-destructive/15 rounded-2xl px-6 py-6 mb-6 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Please allow location access for this site in your browser or
                            device settings so the app can verify your location.
                        </p>

                        <p className="text-sm text-muted-foreground mt-2">
                            कृपया इस साइट के लिए अपने ब्राउज़र या डिवाइस सेटिंग्स में स्थान
                            अनुमति सक्षम करें।
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <button onClick={verifyLocation} className="w-full bg-blue-400 h-12 rounded-2xl text-center text-sm font-medium mt-6 text-white">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- NO GEOLOCATION ---------------- */

    if (status === "no-geolocation") {
        return (
            <div className="mobile-container flex items-center justify-center h-screen text-center p-6">
                <div>
                    <h2 className="text-xl font-bold">Geolocation Not Supported</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Your browser does not support location services.
                    </p>
                </div>
            </div>
        );
    }

    /* ---------------- OUTSIDE GEOFENCE ---------------- */

    if (status === "denied") {
        return (
            <div className="mobile-container">

                <div className="mobile-container flex items-center justify-center h-screen text-center p-6">
                    <h2 className="text-xl font-bold text-destructive">
                        Access Restricted
                    </h2>
                    <div>
                        <div className=" mt-3 bg-destructive/5 border border-destructive/15 rounded-2xl px-6 py-6 mb-6">
                            <MapPin className="w-10 h-10 text-destructive mx-auto mb-4" />

                            <h2 className="text-lg font-semibold text-destructive">
                                You are currently more than {radius} meters away from the Kasta
                                Plant
                            </h2>

                            <p className="text-sm text-muted-foreground mt-2">
                                आप अभी कास्ता प्लांट से {radius} मीटर से अधिक दूरी पर हैं
                            </p>
                        </div>

                        <button
                            onClick={verifyLocation}
                            className="w-full bg-blue-400 h-12 rounded-2xl text-center text-sm font-medium mt-6 text-white">
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

        );
    }

    /* ---------------- ALLOWED ---------------- */

    return children;
};

export default GeoGuard;