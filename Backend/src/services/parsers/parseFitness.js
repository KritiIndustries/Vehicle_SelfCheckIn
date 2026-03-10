
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";
const parseFitness = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

    return {
        expiryDate: dates[0] || null
    };
};
export default parseFitness;