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

import findMatch from "./findMatch.js";
import normalizeText from "./normalizeText.js";
import regexPatterns from "./regexPatterns.js";

const parseInsurance = (lines) => {

    const normalized = normalizeText(lines);
    const text = normalized.join("\n");

    const policyNo = findMatch(text, regexPatterns.policyNo);

    let expiryDate = null;

    // 1️⃣ "to:"
    let match = text.match(/to[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i);

    // 2️⃣ policy end date
    if (!match)
        match = text.match(/policy\s*end\s*date[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i);

    // 3️⃣ valid upto
    if (!match)
        match = text.match(/valid\s*(upto|till)[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i);

    // 4️⃣ expiry date
    if (!match)
        match = text.match(/expiry\s*date[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i);

    if (match)
        expiryDate = match[1] || match[2];

    // 5️⃣ fallback → last date in document
    if (!expiryDate) {
        const dates = [...text.matchAll(regexPatterns.date)].map(d => d[0]);
        expiryDate = dates.length ? dates[dates.length - 1] : null;
    }

    return {
        policyNo,
        expiryDate
    };
};

export default parseInsurance;