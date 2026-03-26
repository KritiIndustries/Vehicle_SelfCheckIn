import findMatch from "./parsers/findMatch.js";
import normalizeText from "./parsers/normalizeText.js";
import regexPatterns from "./parsers/regexPatterns.js";
import { extractTextFromS3Url } from "./textract.service.js";


export const extractVehicleNumbersFromSelfie = async (imageUrl) => {
    const lines = await extractTextFromS3Url(imageUrl);

    const normalized = normalizeText(lines);

    console.log("OCR:", normalized);

    const tokens = normalized
        .join(" ")
        .split(/\s+/)
        .map(t => fixCommonOCRMistakes(t))
        .filter(Boolean);

    console.log("TOKENS:", tokens);

    const regex = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{3,4}$/;

    const results = new Set();

    for (let i = 0; i < tokens.length; i++) {

        const state = tokens[i].substring(0, 2);

        if (!validStateCodes.has(state)) continue;

        let combined = tokens[i];

        for (let j = i + 1; j < tokens.length && j < i + 4; j++) {
            combined += tokens[j];

            const clean = combined.replace(/\s/g, "");

            if (regex.test(clean)) {
                results.add(clean);
            }
        }

        // also check single token (important)
        if (regex.test(tokens[i])) {
            results.add(tokens[i]);
        }
    }

    return Array.from(results);
};

export const cleanVehicleNo = (v) => {
    return v?.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

export const isVehicleMatch = (detected, expected) => {
    const a = cleanVehicleNo(detected);
    const b = cleanVehicleNo(expected);

    if (!a || !b) return false;

    let mismatch = 0;

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) mismatch++;
    }

    return mismatch <= 2; // allow OCR error
};

export const validStateCodes = new Set([
    "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA",
    "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML",
    "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR",
    "TS", "UK", "UP", "WB"
]);

export const fixCommonOCRMistakes = (text) => {
    return text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .replace(/O/g, "0")
        .replace(/I/g, "1")
        .replace(/Z/g, "2")
        .replace(/S/g, "5")
        .replace(/B/g, "8");
};
