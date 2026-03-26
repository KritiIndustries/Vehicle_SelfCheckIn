import regexPatterns from "./regexPatterns.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import convertToSqlDate from "../../utils/convertToSqlDate.js";

//this is working but expitry date is not coming correctly, need to check the logic for that
// const parseRC = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     const vehicleNo = findMatch(text, regexPatterns.vehicleNo);

//     const chassisNo = findMatch(text, regexPatterns.chassisNo);

//     let registrationDate = null;

//     const regDateRegex =
//         /(DATE\s*OF\s*REGN|REGN\s*DATE|REGISTRATION\s*DATE)[^0-9]{0,20}(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;

//     for (const line of normalized) {

//         const match = line.match(regDateRegex);

//         if (match) {
//             registrationDate = match[2];
//             break;
//         }
//     }

//     let expiryDate = null;

//     if (registrationDate) {

//         const parts = registrationDate.split(/[-\/]/);

//         const day = parseInt(parts[0]);
//         const month = parseInt(parts[1]) - 1;
//         const year = parseInt(parts[2]);

//         const date = new Date(year, month, day);

//         date.setFullYear(date.getFullYear() + 15);

//         expiryDate = date.toISOString().split("T")[0];
//     }

//     return {
//         vehicleNo,
//         chassisNo,
//         expiryDate
//     };
// };
//This is not working for 17-Jan-2018 Fornmat
// const parseRC = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     const vehicleNo = findMatch(text, regexPatterns.vehicleNo);

//     const chassisNo = findMatch(text, regexPatterns.chassisNo);

//     let registrationDate = null;

//     const vehicleDateRegex =
//         /([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/;

//     for (const line of normalized) {

//         const match = line.match(vehicleDateRegex);

//         if (match) {
//             registrationDate = match[2];
//             break;
//         }
//     }

//     let expiryDate = null;

//     if (registrationDate) {

//         const [day, month, year] = registrationDate.split(/[-\/]/);

//         const regDate = new Date(year, month - 1, day);

//         regDate.setFullYear(regDate.getFullYear() + 15);

//         expiryDate = regDate.toISOString().split("T")[0];
//     }

//     return {
//         vehicleNo,
//         chassisNo,
//         expiryDate
//     };
// };
const parseRC = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const vehicleNo = findMatch(text, regexPatterns.vehicleNo);
    const chassisNo = findMatch(text, regexPatterns.chassisNo);

    let registrationDate = null;

    // ✅ UNIVERSAL DATE REGEX (INDIA RC SAFE)
    const dateRegex =
        /\b(\d{1,2}[-\/\s](?:\d{1,2}|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-\/\s]\d{2,4})\b/i;

    for (let i = 0; i < normalized.length; i++) {

        const line = normalized[i];

        // 🎯 CASE 1: Date present in same line
        let match = line.match(dateRegex);
        if (match) {
            registrationDate = match[1];
            break;
        }

        // 🎯 CASE 2: "DATE OF REGN" → next line contains date
        if (/DATE.*REGN|REGN.*DATE/i.test(line) && normalized[i + 1]) {
            const nextLine = normalized[i + 1];
            match = nextLine.match(dateRegex);
            if (match) {
                registrationDate = match[1];
                break;
            }
        }
    }

    let expiryDate = null;

    if (registrationDate) {

        const sqlDate = convertToSqlDate(registrationDate);

        if (sqlDate) {
            const regDate = new Date(sqlDate);
            regDate.setFullYear(regDate.getFullYear() + 15);

            expiryDate = regDate.toISOString().split("T")[0];
        }
    }

    return {
        vehicleNo,
        chassisNo,
        expiryDate
    };
};




export default parseRC;