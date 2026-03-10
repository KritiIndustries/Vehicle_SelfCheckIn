import sharp from "sharp";
import ApiError from "../utils/ApiError.js";

// Keep this quite low so that most normal photos pass
// and only very blurry images are rejected.
const BLUR_THRESHOLD = 2; // lower = blurrier

const computeVariance = (data) => {
    let sum = 0;
    let sumSq = 0;
    const n = data.length;

    for (let i = 0; i < n; i++) {
        const v = data[i];
        sum += v;
        sumSq += v * v;
    }

    const mean = sum / n;
    return sumSq / n - mean * mean;
};

export const ensureImageQuality = async (buffer) => {
    try {
        const base = sharp(buffer);
        const metadata = await base.metadata();

        if (!metadata.width || !metadata.height) {
            throw new ApiError(
                400,
                "कृपया साफ़ फोटो अपलोड करें।"
            );
        }

        const laplacianKernel = {
            size: 3,
            kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0],
        };

        const { data } = await base
            .greyscale()
            .resize(512, null, { fit: "inside" })
            .convolve(laplacianKernel)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const variance = computeVariance(data);

        if (variance < BLUR_THRESHOLD) {
            throw new ApiError(
                400,
                "Image is too blurry. कृपया साफ़ फोटो अपलोड करें।"
            );
        }
    } catch (err) {
        if (err instanceof ApiError) {
            throw err;
        }

        console.error("Image quality check failed:", err);
        throw new ApiError(
            400,
            "Image quality is not good. कृपया साफ़ फोटो अपलोड करें।"
        );
    }
};

