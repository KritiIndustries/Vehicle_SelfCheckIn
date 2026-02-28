export const calculateDistanceMeters = (
    lat1,
    lon1,
    lat2,
    lon2
) => {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const checkGeofenceAccess = async () => {
    const plantLat = parseFloat(import.meta.env.VITE_PLANT_LAT);
    const plantLng = parseFloat(import.meta.env.VITE_PLANT_LNG);
    const radius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS);

    if (!navigator.geolocation) {
        throw new Error("Geolocation not supported");
    }

    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
        });
    });

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    const distance = calculateDistanceMeters(
        plantLat,
        plantLng,
        userLat,
        userLng
    );

    return {
        allowed: distance <= radius,
        distance,
        userLat,
        userLng,
    };
};