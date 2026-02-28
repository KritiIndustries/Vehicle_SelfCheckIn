const addWatermark = async (file, location) => {
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

                const watermarkText = `
${timestamp}
Lat: ${location.lat.toFixed(5)}
Lng: ${location.lng.toFixed(5)}
                `;

                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(20, canvas.height - 120, 450, 100);

                ctx.fillStyle = "white";
                ctx.font = "28px Arial";
                ctx.fillText(timestamp, 30, canvas.height - 80);
                ctx.fillText(
                    `Lat: ${location.lat.toFixed(5)}`,
                    30,
                    canvas.height - 50
                );
                ctx.fillText(
                    `Lng: ${location.lng.toFixed(5)}`,
                    30,
                    canvas.height - 20
                );

                canvas.toBlob(
                    (blob) => resolve(blob),
                    "image/jpeg",
                    0.9
                );
            };
        };
    });
};
export default addWatermark;