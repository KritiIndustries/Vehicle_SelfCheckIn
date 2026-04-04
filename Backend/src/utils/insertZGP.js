import { log } from "console";
import asyncHandler from "./asyncHandler.js";
import axios from "axios";

// const insertZGP = asyncHandler(async (data, token,) => {     
//     const url = `http://ktappdq.kritiindia.com:8010/sap/opu/odata/sap/ZGP_REGISTRATION_API_SRV/GatePassRegistrationSet`
//     const now = new Date();
//     const todayStr = now.toISOString().slice(0, 10).replace(/-/g, "");
//     const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
//     console.log("Data", data);

//     const payload = {
//         "ReportInDate": todayStr,
//         "ReportInTime": timeStr,
//         "VehicleRegNumb": data.vehicleNo,
//         "TrailerRegNumb": "MP04TR5681",
//         "DriverName": data.driverName,
//         "TransporterCode": "92000001",
//         "Note": "API Test",
//         "DoNumber": data.doNo,
//     }
//     const response = await axios.post(url, payload, {
//         headers: {
//             "Content-Type": "application/json",
//             "x-csrf-token": token.csrfToken,
//             Authorization: token.BASIC_AUTH,
//             Cookie: token.cookies,
//         },
//     })
//     const responseData = response.data?.d || {};
//     console.log("Response Data", responseData);

//     if (!responseData.Success) {
//         return { success: false, message: responseData.Message || "Failed to insert ZGP data" };
//     }
//     console.log(responseData);
//     return { success: true, responseData, message: "ZGP data inserted successfully" };

// }
// )
// export default insertZGP;

const insertZGP = async (data, token) => {
    try {

        const url = `http://ktappdq.kritiindia.com:8010/sap/opu/odata/sap/ZGP_REGISTRATION_API_SRV/GatePassRegistrationSet`;

        const now = new Date();
        // ✅ Always use IST (UTC+5:30) regardless of server timezone
        const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
        const istNow = new Date(now.getTime() + istOffset);
        // ✅ Format date as YYYYMMDD from IST time
        const todayStr = istNow.toISOString().slice(0, 10).replace(/-/g, "");
        // ✅ Format time as HHMMSS from IST time
        const timeStr = istNow.toISOString().slice(11, 19).replace(/:/g, "");

        const payload = {
            ReportInDate: todayStr,
            ReportInTime: timeStr,
            VehicleRegNumb: data.vehicleNo,
            TrailerRegNumb: data.lrNumber,
            DriverName: data.driverName,
            TransporterCode: "92000001",
            DoNumber: data.doNo,
        };
        console.log("Playload", payload);


        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": token.csrfToken,
                Authorization: token.BASIC_AUTH,
                Cookie: token.cookies,
            },
        });

        const responseData = response.data?.d || {};

        if (!responseData.Success) {
            return {
                success: false,
                message: responseData.Message || "Failed to insert ZGP data"
            };
        }

        return {
            success: true,
            responseData
        };

    } catch (error) {

        return {
            success: false,
            message:
                error.response?.data?.error?.message?.value ||
                error.message
        };
    }
};
export default insertZGP