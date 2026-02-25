import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../Config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// export const verifyOtp = asyncHandler(async (req, res) => {

//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//         throw new ApiError(400, "Phone and OTP are required");
//     }

//     const guard = await prisma.guard_Master.findUnique({
//         where: { Mobile: phone }
//     });

//     if (!guard) {
//         throw new ApiError(404, "Guard not found");
//     }

//     // Check OTP match
//     if (guard.OTP !== otp) {
//         throw new ApiError(401, "Invalid OTP");
//     }

//     // Check expiry
//     if (!guard.OTP_Expiry || guard.OTP_Expiry < new Date()) {
//         throw new ApiError(401, "OTP expired");
//     }

//     // Clear OTP after success
//     await prisma.guard_Master.update({
//         where: { phone },
//         data: {
//             OTP: null,
//             OTP_Expiry: null
//         }
//     });

//     // Generate JWT
//     const token = jwt.sign(
//         { id: guard.id, phone: guard.phone },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//     );
//     return res.status(200).json(
//         new ApiResponse(200, { token }, "Login successful")
//     );
// });

export const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        throw new ApiError(400, "Phone and OTP are required");
    }

    const guard = await prisma.guard_Master.findUnique({
        where: { Mobile: phone }
    });

    if (!guard) {
        throw new ApiError(404, "Guard not found");
    }

    // OTP match check
    if (guard.OTP !== otp) {
        throw new ApiError(401, "Invalid OTP");
    }

    // Expiry check
    if (!guard.OTP_Expiry || guard.OTP_Expiry < new Date()) {
        throw new ApiError(401, "OTP expired");
    }

    // Clear OTP using Guard_Id (safest way)
    await prisma.guard_Master.update({
        where: { Guard_Id: guard.Guard_Id },
        data: {
            OTP: null,
            OTP_Expiry: null
        }
    });

    // Generate JWT (FIXED field names)
    const token = jwt.sign(
        {
            id: guard.Guard_Id,
            phone: guard.Mobile
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return res.status(200).json({
        success: true,
        data: { token },
        message: "Login successful"
    });
});