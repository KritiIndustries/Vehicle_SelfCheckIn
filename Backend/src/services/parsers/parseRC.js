import regexPatterns from "./regexPatterns.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
const parseRC = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const vehicleNo = findMatch(text, regexPatterns.vehicleNo);

    const chassisNo = findMatch(text, regexPatterns.chassisNo);

    const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

    return {
        vehicleNo,
        chassisNo,
        expiryDate: dates[0] || null
    };
};
export default parseRC;