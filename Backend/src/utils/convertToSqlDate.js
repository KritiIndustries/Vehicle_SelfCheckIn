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

    // handle month names
    if (months[month]) {
        month = months[month];
    }

    // numeric month
    if (month.length === 1) {
        month = "0" + month;
    }

    if (day.length === 1) {
        day = "0" + day;
    }

    return `${year}-${month}-${day}`;
};
export default convertToSqlDate;