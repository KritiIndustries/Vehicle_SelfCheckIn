// services/image.service.js

export const compressImage = (file, maxWidth = 1280, quality = 0.7) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const scale = maxWidth / img.width;

                canvas.width = maxWidth;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    "image/jpeg",
                    quality
                );
            };
        };
    });
};

export const addWatermark = (file, location) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const timestamp = new Date().toLocaleString();

                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(20, canvas.height - 110, 420, 90);

                ctx.fillStyle = "white";
                ctx.font = "22px Arial";

                ctx.fillText(timestamp, 30, canvas.height - 70);
                ctx.fillText(`Lat: ${location.lat.toFixed(5)}`, 30, canvas.height - 45);
                ctx.fillText(`Lng: ${location.lng.toFixed(5)}`, 30, canvas.height - 20);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    "image/jpeg",
                    0.9
                );
            };
        };
    });
};

export const validateCameraCapture = (fileInputRef, file) => {
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image capture allowed.");
    }

    if (!fileInputRef.current?.capture) {
        throw new Error("Gallery upload not allowed.");
    }
};