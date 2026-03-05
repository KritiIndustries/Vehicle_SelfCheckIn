// services/location.service.js

export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
};

export const validateCoordinates = (coords) => {
    if (!coords) return false;
    const lat = parseFloat(coords.lat ?? coords.latitude);
    const lng = parseFloat(coords.lng ?? coords.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
};

export const normalizeForApi = (coords) => {
    if (!validateCoordinates(coords)) {
        throw new Error('Invalid coordinates');
    }

    return {
        latitude: parseFloat(coords.lat ?? coords.latitude),
        longitude: parseFloat(coords.lng ?? coords.longitude),
    };
};