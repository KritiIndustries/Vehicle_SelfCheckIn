import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../Config/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendSMS } from "../utils/sendSms.js";
import crypto from "crypto";
import axios from "axios";
import fetchCsrfToken from "../services/fetchCsrfToken.service.js";

const formatSapDate = (d) => {
    const yyyy = d.getFullYear().toString();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
};

const formatSapTime = (d) => {
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}${mi}${ss}`;
};

const postToZgp = async (payload) => {
    const url =
        "http://ktappdq.kritiindia.com:8010/sap/opu/odata/sap/ZGP_REGISTRATION_API_SRV/GatePassRegistrationSet";
    const token = await fetchCsrfToken(url);

    const response = await axios.post(url, payload, {
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": token.csrfToken,
            Authorization: token.BASIC_AUTH,
            Cookie: token.cookies,
        },
    });

    const responseData = response.data?.d || {};
    if (responseData.Success === false) {
        throw new ApiError(502, responseData.Message || "ZGP API failed");
    }

    return responseData;
};


export const guardLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required"
        });
    }

    const guard = await prisma.guard_Master.findUnique({
        where: {
            Mobile: phone
        }
    });

    // ✅ DO NOT THROW ERROR — RETURN CLEAN RESPONSE
    if (!guard) {
        return res.status(200).json({
            status: 200,
            success: false,
            message: "Guard not found!!"
        });
    }

    // Generate OTP
    const otp = crypto.randomInt(1000, 9999).toString();

    await prisma.guard_Master.update({
        where: {
            Mobile: phone   // ✅ FIX (was hardcoded before)
        },
        data: {
            OTP: otp,
            OTP_Expiry: new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    const message = `Your OTP to log in to Kriti Vehicle Reporting System is ${otp}. This OTP is valid for 5 minutes. Please do not share this OTP with anyone. Regards KRITI GROUP`;

    await sendSMS({
        mobile: `+91${phone}`,
        message,
        OTPTemplate: process.env.OTP_TEMPLATE_ID
    });

    return res.status(200).json({
        success: true,
        message: "OTP sent successfully"
    });
});

export const getCheckedinDetails = asyncHandler(async (req, res) => {

    const details = await prisma.driver_Checkin.findMany({
        where: {
            Status: {
                in: ["ReportIn", "CheckedIn"] // This looks for both statuses
            }
        },
        orderBy: {
            ReportIn_Time: "desc"
        },
        include: {
            Documents: {
                orderBy: {
                    Created_At: "asc"
                },
                select: {
                    Id: true,
                    Doc_Type: true,
                    Verified: true,
                    Image_Path: true,
                    Verified_By: true,
                    Created_At: true
                }
            }
        }
    });

    const formatted = details.map(item => ({
        ...item,
        Documents: item.Documents.map(doc => ({
            ...doc,
            Image_Path: doc.Image_Path.replace(
                "https://ocr-kriti.s3.ap-south-1.amazonaws.com/",
                ""
            )
        }))
    }));

    return res.status(200).json(
        new ApiResponse(200, formatted, "Checked-in details retrieved successfully")
    );
});

export const approveEntry = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new ApiError(400, "Invalid id");

    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: id },
    });
    if (!checkin) throw new ApiError(404, "Checkin not found");
    if (!checkin.Zgp) throw new ApiError(400, "GatePass (ZGP) not found for this record");

    const now = new Date();
    const payload = {
        GatePass: checkin.Zgp,
        ChkInDate: formatSapDate(now),
        ChkInTime: formatSapTime(now),
    };

    await postToZgp(payload);

    const updated = await prisma.driver_Checkin.update({
        where: { Id: id },
        data: {
            Status: "CheckedIn",
            Entry_Time: now,
        },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Check-in saved"));
});

export const checkoutVehicle = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new ApiError(400, "Invalid id");

    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: id },
    });
    if (!checkin) throw new ApiError(404, "Checkin not found");
    if (!checkin.Zgp) throw new ApiError(400, "GatePass (ZGP) not found for this record");

    const now = new Date();
    const payload = {
        GatePass: checkin.Zgp,
        LeaveDate: formatSapDate(now),
        LeaveTime: formatSapTime(now),
    };

    await postToZgp(payload);

    const updated = await prisma.driver_Checkin.update({
        where: { Id: id },
        data: {
            Status: "CheckedOut",
            Exit_Time: now,
        },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Checkout saved"));
});