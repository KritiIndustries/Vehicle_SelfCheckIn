import { useEffect, useState } from "react";
import { calculateDistanceMeters } from "@/services/geofence.service";

const plantLat = parseFloat(import.meta.env.VITE_PLANT_LAT);
const plantLng = parseFloat(import.meta.env.VITE_PLANT_LNG);
const radius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS);

const GeoGuard = ({ children }) => {
    const [status, setStatus] = useState("checking"); // checking | allowed | denied

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
                    } else {
                        setStatus("denied");
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
                <p className="text-muted-foreground text-sm">
                    Checking plant location...
                </p>
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
                        You must be within {radius} meters of plant location.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default GeoGuard;