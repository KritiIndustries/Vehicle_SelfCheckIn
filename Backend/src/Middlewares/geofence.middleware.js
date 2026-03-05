// middleware/geofence.middleware.js


import calculateDistance from "../utils/geofence.util.js";
import prisma from "../Config/index.js";

const PLANT_LAT = parseFloat(process.env.PLANT_LAT);
const PLANT_LNG = parseFloat(process.env.PLANT_LNG);
const RADIUS = 500;

const geofenceMiddleware = async (req, res, next) => {
    try {
        const { latitude, longitude, lat, lng } = req.body;
        const latVal = latitude ?? lat;
        const lngVal = longitude ?? lng;

        if (latVal == null || lngVal == null) {
            return res.status(400).json({
                success: false,
                message: "Location required",
            });
        }

        const parsedLat = parseFloat(latVal);
        const parsedLng = parseFloat(lngVal);

        const distance = calculateDistance(
            PLANT_LAT,
            PLANT_LNG,
            parsedLat,
            parsedLng
        );

        if (distance > RADIUS) {
            // 🚨 Log suspicious attempt
            await prisma.security_Logs.create({
                data: {
                    userId: req.user?.id || null,
                    ip: req.ip,
                    latitude: parsedLat,
                    longitude: parsedLng,
                    distance,
                    reason: "Outside Geofence",
                },
            });

            return res.status(403).json({
                success: false,
                message: "Access denied. Outside plant boundary.",
            });
        }

        next();
    } catch (error) {
        console.error("Geofence error:", error);

        return res.status(500).json({
            success: false,
            message: "Geofence validation failed",
        });
    }
};

export default geofenceMiddleware;