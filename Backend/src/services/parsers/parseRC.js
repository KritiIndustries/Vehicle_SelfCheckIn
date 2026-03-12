import regexPatterns from "./regexPatterns.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";

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
const parseRC = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    const vehicleNo = findMatch(text, regexPatterns.vehicleNo);

    const chassisNo = findMatch(text, regexPatterns.chassisNo);

    let registrationDate = null;

    const vehicleDateRegex =
        /([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/;

    for (const line of normalized) {

        const match = line.match(vehicleDateRegex);

        if (match) {
            registrationDate = match[2];
            break;
        }
    }

    let expiryDate = null;

    if (registrationDate) {

        const [day, month, year] = registrationDate.split(/[-\/]/);

        const regDate = new Date(year, month - 1, day);

        regDate.setFullYear(regDate.getFullYear() + 15);

        expiryDate = regDate.toISOString().split("T")[0];
    }

    return {
        vehicleNo,
        chassisNo,
        expiryDate
    };
};




export default parseRC;