import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../Config/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendSMS } from "../utils/sendSms.js";
import crypto from "crypto";



export const guardLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const guard = await prisma.guard_Master.findUnique({
        where: {
            Mobile: phone   // must match schema exactly
        }
    });

    if (!guard) {
        throw new ApiError(404, "Guard not found");
    }
    // Generate 4 digit OTP
    const otp = crypto.randomInt(1000, 9999).toString();

    //Save OTP in DB (add otp & otpExpiry column)
    await prisma.guard_Master.update({
        where: {
            Mobile: "9399229814"
        },
        data: {
            OTP: otp,
            OTP_Expiry: new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    // Your DLT template:
    // "Your OTP to log in to Kriti Vehicle Reporting System is {#var#}..."

    const message = `Your OTP to log in to Kriti Vehicle Reporting System is ${otp}. This OTP is valid for 5 minutes. Please do not share this OTP with anyone. Regards KRITI GROUP`;

    await sendSMS({
        mobile: `+91${phone}`,
        message,
        OTPTemplate: process.env.OTP_TEMPLATE_ID
    });

    return new ApiResponse(200, null, "OTP sent successfully")

});
export const getCheckedinDetails = asyncHandler(async (req, res) => {

    const details = await prisma.driver_Checkin.findMany({
        where: {
            Status: "CheckedIn"
        },
        orderBy: {
            Entry_Time: "desc"
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

    // return new ApiResponse(
    //     200,
    //     details,
    //     "Checked-in details retrieved successfully"
    // );
    return res.status(200).json(new ApiResponse(200, details, "Checked-in details retrieved successfully"));
});
