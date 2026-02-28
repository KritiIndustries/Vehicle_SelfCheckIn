// services/camera.service.js

export const openCamera = (ref) => {
    ref?.current?.click();
};

export const openInputByType = (ref, type) => {
    ref?.current?.[type]?.click();
};