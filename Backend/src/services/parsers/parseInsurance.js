// import findMatch from "./findMatch.js";
// import normalizeText from "./normalizeText.js";
// import regexPatterns from "./regexPatterns.js";
// const parseInsurance = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     const policyNo = findMatch(text, regexPatterns.policyNo);

//     const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);

//     return {
//         policyNo,
//         expiryDate: dates[0] || null
//     };
// };
// export default parseInsurance;

import convertToSqlDate from "../../utils/convertToSqlDate.js";
import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";


//This is not working for Prevous Policy Number
// const parseInsurance = (lines) => {

//     const normalized = normalizeText(lines);
//     const text = normalized.join(" ");

//     // ✅ 1. POLICY NUMBER (STRICT)
//     let policyNo = null;
//     const policyMatch = text.match(/POLICY\s*NO\.?[:\s]*([A-Z0-9\/\-]{10,30})/i);
//     if (policyMatch) {
//         policyNo = policyMatch[1];
//     }

//     let expiryDate = null;

//     // ✅ 2. EXPIRY (MULTI-LINE SAFE)
//     for (let i = 0; i < normalized.length; i++) {

//         const combined = [
//             normalized[i] || "",
//             normalized[i + 1] || "",
//             normalized[i + 2] || ""
//         ].join(" ");

//         let match = null;

//         // NEXT RENEWAL
//         match = combined.match(/NEXT\s*RENEWAL.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

//         // TO MIDNIGHT OF
//         if (!match)
//             match = combined.match(/TO\s*(MIDNIGHT\s*OF)?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

//         // TO DATE & TIME
//         if (!match)
//             match = combined.match(/TO\s*DATE\s*&?\s*TIME\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

//         if (match) {
//             const date = match[1] || match[2];
//             expiryDate = convertToSqlDate(date);
//             break;
//         }
//     }

//     // ✅ 3. FALLBACK (MAX DATE)
//     if (!expiryDate) {

//         let allDates = [];

//         normalized.forEach(line => {
//             const matches = line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g);
//             if (matches) allDates.push(...matches);
//         });

//         const parsed = allDates
//             .map(d => convertToSqlDate(d))
//             .filter(Boolean)
//             .map(d => new Date(d));

//         if (parsed.length) {
//             const maxDate = new Date(Math.max(...parsed));
//             expiryDate = maxDate.toISOString().split("T")[0];
//         }
//     }

//     return {
//         policyNo,
//         expiryDate
//     };
// };
const parseInsurance = (lines) => {
    const normalized = normalizeText(lines);
    const text = normalized.join(" ");

    // ✅ 1. POLICY NUMBER
    let policyNo = null;

    // Step 1: Find the index of "POLICY NO" label (not preceded by PREVIOUS)
    let policyLabelIndex = -1;
    for (let i = 0; i < normalized.length; i++) {
        const line = normalized[i];
        if (/PREVIOUS/i.test(line)) continue;
        if (/^\s*POLICY\s*NO\.?\s*$/i.test(line)) {
            policyLabelIndex = i;
            break;
        }
    }

    if (policyLabelIndex !== -1) {
        // Search in a window: 3 lines BEFORE and 3 lines AFTER the label
        const searchWindow = [];
        for (let offset = -3; offset <= 3; offset++) {
            const idx = policyLabelIndex + offset;
            if (idx >= 0 && idx < normalized.length && offset !== 0) {
                searchWindow.push({ idx, line: normalized[idx] });
            }
        }

        for (const { line } of searchWindow) {
            if (/PREVIOUS/i.test(line)) continue;
            // Match formats like: 10003/31/26/220606 or VGC1324778000100 or 1104003124P108964601
            const match = line.match(/^([A-Z0-9][A-Z0-9\/\-]{8,29})$/i);
            if (match) {
                policyNo = match[1];
                break;
            }
        }
    }

    // Step 2: Fallback — scan full text for "POLICY NO: value" on same or next line
    if (!policyNo) {
        for (let i = 0; i < normalized.length; i++) {
            const line = normalized[i];
            if (/PREVIOUS/i.test(line)) continue;

            // Inline match: "POLICY NO.:1104003124P108964601"
            const inlineMatch = line.match(/POLICY\s*NO\.?[:\s]+([A-Z0-9\/\-]{10,30})/i);
            if (inlineMatch) {
                policyNo = inlineMatch[1];
                break;
            }

            // Next-line match
            if (/POLICY\s*NO\.?\s*$/i.test(line)) {
                const next = normalized[i + 1] || "";
                if (/PREVIOUS/i.test(next)) continue;
                const nextMatch = next.match(/^([A-Z0-9\/\-]{10,30})$/i);
                if (nextMatch) {
                    policyNo = nextMatch[1];
                    break;
                }
            }
        }
    }

    // ✅ 2. EXPIRY DATE (unchanged)
    let expiryDate = null;

    for (let i = 0; i < normalized.length; i++) {
        const combined = [
            normalized[i] || "",
            normalized[i + 1] || "",
            normalized[i + 2] || ""
        ].join(" ");

        let match = null;

        match = combined.match(/NEXT\s*RENEWAL.*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

        if (!match)
            match = combined.match(/TO\s*(MIDNIGHT\s*OF)?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

        if (!match)
            match = combined.match(/TO\s*DATE\s*&?\s*TIME\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

        if (match) {
            const date = match[1] || match[2];
            expiryDate = convertToSqlDate(date);
            break;
        }
    }

    // ✅ 3. FALLBACK MAX DATE
    if (!expiryDate) {
        let allDates = [];
        normalized.forEach(line => {
            const matches = line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g);
            if (matches) allDates.push(...matches);
        });

        const parsed = allDates
            .map(d => convertToSqlDate(d))
            .filter(Boolean)
            .map(d => new Date(d));

        if (parsed.length) {
            const maxDate = new Date(Math.max(...parsed));
            expiryDate = maxDate.toISOString().split("T")[0];
        }
    }

    return { policyNo, expiryDate };
};



export default parseInsurance;