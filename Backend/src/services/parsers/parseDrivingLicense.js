import convertToSqlDate from "../../utils/convertToSqlDate.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";

// const parseDrivingLicense= (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     const licenseNo = findMatch(text, regexPatterns.dlNumber);

//     const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

//     const nameLine =
//         normalized.find(l => l.includes("NAME")) ||
//         normalized.find(l =>
//             /^[A-Z\s]{5,}$/.test(l) &&
//             !l.includes("LICENCE") &&
//             !l.includes("INDIA")
//         );

//     return {
//         name: nameLine ? nameLine.replace(/NAME[:\-]*/, "").trim() : null,
//         licenseNo,
//         expiryDate: dates[1] || dates[0] || null
//     };
// };
const parseDrivingLicense = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    let licenseNo = null;
    let expiryDate = null;
    let name = null;

    /* DL NUMBER */

    const dlMatch = text.match(/\b[A-Z]{2}\d{2}\s?\d{4,12}\b/);

    if (dlMatch) {
        licenseNo = dlMatch[0].replace(/\s+/g, "");
    }

    /* NAME */

    for (let i = 0; i < normalized.length; i++) {

        if (normalized[i].includes("NAME") && normalized[i + 1]) {
            name = normalized[i + 1].trim();
        }
    }

    /* VALIDITY TR (Transport expiry) */

    const validityLine = normalized.find(l =>
        l.includes("VALIDITY") && l.includes("TR")
    );

    if (validityLine) {

        const nextLine = normalized[normalized.indexOf(validityLine) + 1];

        const dates = [...nextLine.matchAll(regexPatterns.date)].map(d => d[0]);

        if (dates.length === 3) {
            expiryDate = convertToSqlDate(dates[2]); // TR date
        }
    }

    /* fallback if OCR split lines */

    if (!expiryDate) {

        const allDates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

        if (allDates.length >= 3) {
            expiryDate = convertToSqlDate(allDates[2]);
        }
    }

    return {
        name,
        licenseNo,
        expiryDate
    };
};




export default parseDrivingLicense;