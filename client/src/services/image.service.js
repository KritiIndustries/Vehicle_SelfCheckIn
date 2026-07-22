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

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp", ".tiff"];

export const isBrowserRenderableImage = (file) => {
    const name = file?.name || "";
    const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
    const mime = file?.type || "";

    return (mime.startsWith("image/") || !mime || mime === "application/octet-stream") &&
        IMAGE_EXTENSIONS.includes(ext) &&
        ext !== ".heic" &&
        ext !== ".heif";
};

export const optimizeImageForUpload = (
    file,
    { maxDimension = 1600, quality = 0.78 } = {}
) => {
    if (!isBrowserRenderableImage(file)) {
        return Promise.resolve(file);
    }

    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        const cleanup = () => {
            URL.revokeObjectURL(objectUrl);
            img.onload = null;
            img.onerror = null;
        };

        img.onload = () => {
            try {
                const largestSide = Math.max(img.width, img.height);
                const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
                const targetWidth = Math.max(1, Math.round(img.width * scale));
                const targetHeight = Math.max(1, Math.round(img.height * scale));

                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext("2d", { alpha: false });
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob(
                    (blob) => {
                        cleanup();
                        canvas.width = 0;
                        canvas.height = 0;

                        if (!blob || blob.size >= file.size) {
                            resolve(file);
                            return;
                        }

                        const baseName = file.name.replace(/\.[^.]+$/, "");
                        resolve(new File([blob], `${baseName}.jpg`, {
                            type: "image/jpeg",
                            lastModified: Date.now()
                        }));
                    },
                    "image/jpeg",
                    quality
                );
            } catch (error) {
                console.warn("Image optimization failed; uploading original file.", error);
                cleanup();
                resolve(file);
            }
        };

        img.onerror = () => {
            cleanup();
            resolve(file);
        };

        img.src = objectUrl;
    });
};
