const formatApiDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    // Format Time: 01:13 PM
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    // Format Date: 28-02-2026
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${timePart} ${day}-${month}-${year}`;
};
export default formatApiDate;

