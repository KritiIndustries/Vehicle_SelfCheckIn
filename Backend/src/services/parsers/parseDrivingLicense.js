import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";

const parseDrivingLicense= (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const licenseNo = findMatch(text, regexPatterns.dlNumber);

    const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

    const nameLine =
        normalized.find(l => l.includes("NAME")) ||
        normalized.find(l =>
            /^[A-Z\s]{5,}$/.test(l) &&
            !l.includes("LICENCE") &&
            !l.includes("INDIA")
        );

    return {
        name: nameLine ? nameLine.replace(/NAME[:\-]*/, "").trim() : null,
        licenseNo,
        expiryDate: dates[1] || dates[0] || null
    };
};
export default parseDrivingLicense;