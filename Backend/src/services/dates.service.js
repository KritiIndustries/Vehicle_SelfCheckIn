export const formatIST = (date) => {
    return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
    });
};