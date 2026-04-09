import convertToSqlDate from "../../utils/convertToSqlDate.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";


const parseDrivingLicense = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    let licenseNo = null;
    let expiryDate = null;
    let name = null;

    /* DL NUMBER */

    // const dlMatch = text.match(/\b[A-Z]{2}\d{2}\s?\d{4,12}\b/);

    // if (dlMatch) {
    //     licenseNo = dlMatch[0].replace(/\s+/g, "");
    // }
    /* DL NUMBER */

    //it is Wokring Prefect fine but for HR not working that much proper
    // const dlRegexPatterns = [
    //     /\b[A-Z]{2}\d{2}[A-Z][-\s]?\d{4}[-\s]?\d{6,8}\b/,
    //     /\b[A-Z]{2}\d{2}[A-Z][-\s]?\d{4}[-\s]?\d{6,8}\b/, // new format FIRST
    //     /\b[A-Z]{2}\d{2}\s?\d{4,12}\b/                   // old format
    // ];

    // for (const regex of dlRegexPatterns) {
    //     const match = text.match(regex);
    //     if (match) {
    //         licenseNo = match[0]
    //             .replace(/\s+/g, "")
    //             .replace(/-/g, "-");
    //         break;
    //     }
    // }
    /* DL NUMBER */

    // ✅ 1. PRIORITY: DLNUMBER label (most reliable)
    const dlInline = text.match(/DLNUMBER\s*[:\-]?\s*([A-Z]{2}-?\d{10,16})/);

    if (dlInline) {
        licenseNo = dlInline[1].replace(/\s+/g, "");
    }

    // ✅ 2. FALLBACK: regex only if not found above
    if (!licenseNo) {

        const dlRegexPatterns = [
            /\b[A-Z]{2}\d{2}[A-Z][-\s]?\d{4}[-\s]?\d{6,8}\b/,
            /\b[A-Z]{2}\d{2}\s?\d{4,12}\b/
        ];

        for (const regex of dlRegexPatterns) {
            const match = text.match(regex);

            if (match) {
                const candidate = match[0].replace(/\s+/g, "");

                // ❌ skip weak matches like HR10063651
                if (candidate.length < 12) continue;

                licenseNo = candidate;
                break;
            }
        }
    }

    /* NAME */

    // for (let i = 0; i < normalized.length; i++) {
    //     //his can fail if OCR gives: NAME: AAMEEN
    //     if (normalized[i].includes("NAME") && normalized[i + 1]) {
    //         name = normalized[i + 1].trim();
    //     }
    //     // if (normalized[i].includes("NAME")) {
    //     //     const possibleName = normalized[i].split("NAME").pop().trim();
    //     //     if (possibleName) {
    //     //         name = possibleName;
    //     //     } else if (normalized[i + 1]) {
    //     //         name = normalized[i + 1].trim();
    //     //     }
    //     // }
    // }
    /* NAME */

    for (let i = 0; i < normalized.length; i++) {

        if (normalized[i].includes("NAME")) {

            // ✅ Case 1: NAME is in same line (best case)
            const inline = normalized[i].split("NAME").pop().replace(/[:\-]/g, "").trim();

            if (inline && inline.length > 2) {
                name = inline;
                break;
            }

            // ✅ Case 2: fallback to next lines (but skip noise)
            for (let j = i + 1; j <= i + 3; j++) {

                const nextLine = normalized[j];
                if (!nextLine) continue;

                // ❌ skip invalid values
                if (
                    nextLine.includes("SIGNATURE") ||
                    nextLine.includes("DOB") ||
                    nextLine.includes("DATE") ||
                    nextLine.includes("VALIDITY") ||
                    nextLine.includes("BLOOD") ||
                    nextLine.includes("ORGAN")
                ) {
                    continue;
                }

                // ✅ valid name
                if (nextLine.length > 2) {
                    name = nextLine.trim();
                    break;
                }
            }

            break;
        }
    }

    /* VALIDITY TR (Transport expiry) */

    // const validityLine = normalized.find(l =>
    //     l.includes("VALIDITY") && l.includes("NT")
    // );

    // if (validityLine) {

    //     const nextLine = normalized[normalized.indexOf(validityLine) + 1];

    //     const dates = [...nextLine.matchAll(regexPatterns.date)].map(d => d[0]);

    //     if (dates.length === 3) {
    //         expiryDate = convertToSqlDate(dates[2]); // TR date
    //     }
    // }

    // /* fallback if OCR split lines */

    // if (!expiryDate) {

    //     const allDates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

    //     if (allDates.length >= 3) {
    //         expiryDate = convertToSqlDate(allDates[2]);
    //     }
    // }
    /* VALIDITY (NT ONLY — LABEL BASED) */

    // normalize spacing issues like: "VALIDITY(NT)" or "VALIDITY ( NT )"
    const ntRegex = /VALIDITY\s*\(\s*NT\s*\)\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/;

    // ✅ 1. Direct inline match (best case)
    const ntMatch = text.match(ntRegex);

    if (ntMatch) {
        expiryDate = convertToSqlDate(ntMatch[1]);
    }

    // ✅ 2. OCR split case (label and date on different lines)
    // ✅ 2. OCR split case (MP format with multiple dates)
    if (!expiryDate) {

        const index = normalized.findIndex(l =>
            l.includes("VALIDITY") && l.includes("NT")
        );

        if (index !== -1) {

            const nextLine = normalized[index + 1];

            if (nextLine) {
                const dates = [...nextLine.matchAll(regexPatterns.date)].map(d => d[0]);

                if (dates.length >= 2) {
                    // ✅ pick middle date = NT (NOT position hardcoding, but structure-based)
                    expiryDate = convertToSqlDate(dates[1]);
                }
            }
        }
    }

    return {
        name,
        licenseNo,
        expiryDate
    };
};




export default parseDrivingLicense;