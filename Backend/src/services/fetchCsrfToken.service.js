import asyncHandler from "../utils/asyncHandler";

const fetchCsrfToken = asyncHandler(async (SAP_BASE_URL) => {
    const USERNAME = process.env.SAP_USERNAME;
    const PASSWORD = process.env.SAP_PASSWORD;
    const BASIC_AUTH = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    const response = await axios.get(SAP_BASE_URL, {
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": "fetch",
            Authorization: BASIC_AUTH,
        },
    });

    const csrfToken = response.headers["x-csrf-token"];
    const cookies = response.headers["set-cookie"]
        ?.map((c) => c.split(";")[0])
        .join("; ");

    // console.log("✅ CSRF Token fetched successfully");
    return { csrfToken, cookies };

});
export default fetchCsrfToken