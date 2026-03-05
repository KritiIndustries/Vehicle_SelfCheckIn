import { useEffect, useState } from "react";
import { calculateDistanceMeters } from "@/services/geofence.service";
import LocationCheck from "../driver/LocationCheck";
import { MapPin } from "lucide-react";

const plantLat = parseFloat(import.meta.env.VITE_PLANT_LAT);
const plantLng = parseFloat(import.meta.env.VITE_PLANT_LNG);
const radius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS);

const GeoGuard = ({ children }) => {
    const [status, setStatus] = useState("checking"); // checking | allowed | denied
    const [withinRange, setWithinRange] = useState(false);

    useEffect(() => {
        const verifyLocation = async () => {
            if (!navigator.geolocation) {
                setStatus("denied");
                return;
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

                    if (distance <= radius) {
                        setStatus("allowed");
                        setWithinRange(true);
                    } else {
                        setStatus("denied");
                        setWithinRange(false);
                    }
                },
                () => setStatus("denied"),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                }
            );
        };

        verifyLocation();
    }, []);

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
                    <p className="text-sm text-muted-foreground">स्थान की जाँच हो रही है...</p>
                </>
            </div>
        );
    }

    if (status === "denied") {
        return (
            <div className="mobile-container flex items-center justify-center h-screen text-center p-6">
                <div>
                    <h2 className="text-xl font-bold text-destructive">
                        Access Restricted
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        <div className="bg-destructive/5 border border-destructive/15 rounded-2xl px-6 py-6 mb-6">
                            <h2 className="text-lg font-semibold text-destructive">
                                You are currently more than 500 meters away from the Kasta Plant
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                आप वर्तमान में कास्ता प्लांट से {radius} मीटर से अधिक दूरी पर हैं
                            </p>
                        </div>
                    </p>
                </div>
            </div>

        );
    }

    return children;
};

export default GeoGuard;