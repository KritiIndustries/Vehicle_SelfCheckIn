
import convertToSqlDate from "../../utils/convertToSqlDate.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";
// const parseFitnesss = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

//     return {
//         expiryDate: dates[0] || null
//     };
// };
// const parseFitness = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");
//     const chassisNo = findMatch(text, regexPatterns.chassisNo);

//     const expireRegex =
//         /(EXPIRE|EXPIRES|EXPIRY|VALID\s*TILL|VALID\s*UP\s*TO|VALID\s*UPTO)[^0-9]{0,40}(\d{1,2}[-\/](?:\d{1,2}|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-\/]\d{2,4})/i;

//     for (let i = 0; i < normalized.length; i++) {

//         const line = normalized[i];

//         const match = line.match(expireRegex);

//         if (match) {
//             return {
//                 expiryDate: convertToSqlDate(match[2]),
//                 chassisNo: chassisNo
//             };
//         }

//         // Sometimes date is on next line
//         if (/EXPIRE|EXPIRY|VALID/i.test(line) && normalized[i + 1]) {

//             const nextLine = normalized[i + 1];

//             const dateMatch = nextLine.match(
//                 /\d{1,2}[-\/](?:\d{1,2}|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-\/]\d{2,4}/i
//             );

//             if (dateMatch) {
//                 return {
//                     expiryDate: convertToSqlDate(dateMatch[0])
//                 };
//             }
//         }
//     }

//     return { expiryDate: null };
// };
const parseFitness = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const chassisNo = findMatch(text, regexPatterns.chassisNo);

    // 🔥 STEP 1: Try keyword-based detection (your existing logic)
    const expireRegex =
        /(EXPIRE|EXPIRES|EXPIRY|VALID\s*TILL|VALID\s*UP\s*TO|VALID\s*UPTO)[^0-9]{0,50}(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;

    for (let i = 0; i < normalized.length; i++) {
        const line = normalized[i];
        const match = line.match(expireRegex);

        if (match) {
            return {
                expiryDate: convertToSqlDate(match[2]),
                chassisNo
            };
        }
    }

    // 🔥 STEP 2: Fallback → pick latest future date
    const dateRegex = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g;

    let foundDates = [];

    normalized.forEach(line => {
        const matches = line.match(dateRegex);
        if (matches) {
            foundDates.push(...matches);
        }
    });

    if (foundDates.length > 0) {

        // Convert all to Date objects
        const parsedDates = foundDates
            .map(d => {
                const sql = convertToSqlDate(d);
                return sql ? new Date(sql) : null;
            })
            .filter(Boolean);

        // 🔥 Pick MAX date (expiry usually latest)
        const maxDate = new Date(Math.max(...parsedDates));

        return {
            expiryDate: maxDate.toISOString().split("T")[0],
            chassisNo
        };
    }

    return { expiryDate: null, chassisNo };
};
export default parseFitness;