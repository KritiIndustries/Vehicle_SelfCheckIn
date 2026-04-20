



// const convertToSqlDate = (dateStr) => {

//     if (!dateStr) return null;
//     if (dateStr === undefined) return null;
//     if (dateStr === null) return null;

//     const months = {
//         JAN: "01", FEB: "02", MAR: "03", APR: "04",
//         MAY: "05", JUN: "06", JUL: "07", AUG: "08",
//         SEP: "09", OCT: "10", NOV: "11", DEC: "12"
//     };

//     dateStr = dateStr.toUpperCase().trim();

//     // normalize separators
//     dateStr = dateStr.replace(/[\/\s]/g, "-");

//     const parts = dateStr.split("-");

//     if (parts.length !== 3) return null;

//     let [day, month, year] = parts;

//     // handle month names
//     if (months[month]) {
//         month = months[month];
//     }

//     // numeric month
//     if (month.length === 1) {
//         month = "0" + month;
//     }

//     if (day.length === 1) {
//         day = "0" + day;
//     }

//     return `${year}-${month}-${day}`;
// };

// export default convertToSqlDate;

const convertToSqlDate = (dateStr) => {

    if (!dateStr) return null;

    const months = {
        JAN: "01", FEB: "02", MAR: "03", APR: "04",
        MAY: "05", JUN: "06", JUL: "07", AUG: "08",
        SEP: "09", OCT: "10", NOV: "11", DEC: "12"
    };

    dateStr = dateStr.toUpperCase().trim();

    // normalize separators
    dateStr = dateStr.replace(/[\/\s]/g, "-");

    const parts = dateStr.split("-");

    if (parts.length !== 3) return null;

    let [day, month, year] = parts;

    // ✅ Fix year (2-digit → 4-digit)
    if (year.length === 2) {
        year = "20" + year;
    }

    // ✅ Handle month names
    if (months[month]) {
        month = months[month];
    }

    // ✅ Normalize numbers
    if (!isNaN(month)) {
        month = String(parseInt(month)).padStart(2, "0");
    }

    if (!isNaN(day)) {
        day = String(parseInt(day)).padStart(2, "0");
    }

    // ✅ HARD VALIDATION (this is what saves you)
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (!d || !m || !y) return null;
    if (d > 31 || m > 12) return null;

    const iso = `${y}-${month}-${day}`;

    const date = new Date(iso);

    // ✅ FINAL SAFETY CHECK
    if (isNaN(date.getTime())) return null;

    return iso;
};
export default convertToSqlDate;