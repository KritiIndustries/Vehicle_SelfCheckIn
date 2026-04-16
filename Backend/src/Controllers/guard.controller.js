import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../Config/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendSMS } from "../utils/sendSms.js";
import crypto from "crypto";
import axios from "axios";
import fetchCsrfToken from "../services/fetchCsrfToken.service.js";
import { deleteFromS3, uploadToS3 } from "../services/s3.service.js";

// ✅ Helper — get IST date object from any Date
const toIST = (d) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(d.getTime() + istOffset);
};
const formatSapDate = (d) => {
    const ist = toIST(d);
    const yyyy = ist.getUTCFullYear().toString();
    const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(ist.getUTCDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
};


const formatSapTime = (d) => {
    const ist = toIST(d);
    const hh = String(ist.getUTCHours()).padStart(2, "0");
    const mi = String(ist.getUTCMinutes()).padStart(2, "0");
    const ss = String(ist.getUTCSeconds()).padStart(2, "0");
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
        //TODO: Add date filter for today only
        where: {
            AND: [
                { Status: { in: ["ReportIn", "CheckedIn"] } },
                { Status: { not: "Rejected" } }
            ]
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
    //TODO:Check wiehtbrage table , if there is same pass number then allow gaurd to checkin
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
    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized");
    }
    const now = new Date();
    const payload = {
        GatePass: checkin.Zgp,
        ChkInDate: formatSapDate(now),
        ChkInTime: formatSapTime(now),
    };
    console.log("Payload for Entry ZGP", payload);


    await postToZgp(payload);

    const result = await prisma.$transaction(async (tx) => {

        // STEP 1: update checkin status
        const updated = await tx.driver_Checkin.update({
            where: { Id: id },
            data: {
                Status: "CheckedIn",
                Entry_Time: now,
            },
        });

        // STEP 2: update documents
        await tx.driver_Documents.updateMany({
            where: { Driver_Checkin_Id: id },
            data: {
                Verified: true,
                Verified_By: req.user.id
            }
        });

        // STEP 3: Decrement Token for all ReportIn drivers AFTER me
        // ✅ Token not Token_No, and guard against null Token
        if (checkin.Token !== null) {
            await tx.driver_Checkin.updateMany({
                where: {
                    Status: "ReportIn",
                    Token: { gt: checkin.Token }   // ✅ Token not Token_No
                },
                data: {
                    Token: { decrement: 1 }         // ✅ Token not Token_No
                }
            });

            // STEP 4: Set my own token to 0
            await tx.driver_Checkin.update({
                where: { Id: id },
                data: { Token: 0 }                  // ✅ Token not Token_No
            });
        }

        return updated;
    });

    return res.status(200).json(new ApiResponse(200, result, "Check-in saved"));
});

export const checkoutVehicle = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new ApiError(400, "Invalid id");

    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: id },
    });
    const weightbridge = await prisma.weighbridge.findUnique({
        where: { GatePassNo: checkin.Zgp }
    })

    //TODO:Unable this after integration
    // if (!weightbridge) throw new ApiError(404, "Weightbridge not found");
    if (!checkin) throw new ApiError(404, "Checkin not found");
    if (!checkin.Zgp) throw new ApiError(400, "GatePass (ZGP) not found for this record");
    const now = new Date();
    const payload = {
        GatePass: checkin.Zgp,
        LeaveDate: formatSapDate(now),
        LeaveTime: formatSapTime(now),
        UnladenWeight: weightbridge?.TareWeight?.toString() || "8000",
        LadenWeight: weightbridge?.GrossWeight?.toString() || "15000",
    };
    console.log("Payload for Exit ZGP", payload);

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
export const uploadNumberPlate = asyncHandler(async (req, res) => {
    const id = Number(req.body.id);  // ✅ convert to number

    if (!id || !Number.isFinite(id)) {
        throw new ApiError(400, "Valid checkin id is required");
    }

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    // ✅ Check checkin exists and is in correct status
    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: id },
    });
    console.log("Driver Details", checkin);


    if (!checkin) {
        throw new ApiError(404, "Checkin not found");
    }

    // ✅ Only allow before CheckedIn
    if (checkin.Status === "CheckedIn") {
        throw new ApiError(400, "Vehicle already checked in");
    }

    if (checkin.Status === "CheckedOut") {
        throw new ApiError(400, "Vehicle already checked out");
    }

    // ✅ If number plate already exists — delete old S3 + DB and replace
    const existingNumberPlate = await prisma.driver_Documents.findFirst({
        where: {
            Driver_Checkin_Id: id,
            Doc_Type: "numberPlate"
        }
    });

    if (existingNumberPlate) {
        // ✅ Delete old S3 file

        await deleteFromS3(existingNumberPlate.Image_Path);


        // ✅ Delete old DB record
        await prisma.driver_Documents.delete({
            where: {
                Id: existingNumberPlate.Id,
            }
        });
    }

    // ✅ Upload new number plate to S3
    const s3Url = await uploadToS3(req.file, checkin.Do_No, "numberPlate");

    // ✅ Save to DB
    const result = await prisma.driver_Documents.create({
        data: {
            Driver_Checkin_Id: id,
            Doc_Type: "numberPlate",
            Image_Path: s3Url,
            Verified: true,
        }
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Number plate uploaded successfully")
    );
});
export const rejectVehicle = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new ApiError(400, "Invalid id");

    const { reason } = req.body;
    if (!reason || reason.trim() === "") {
        throw new ApiError(400, "Rejection reason is required");
    }
    console.log(reason);


    if (!req.user?.id) throw new ApiError(401, "Unauthorized");

    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: id }
    });


    if (!checkin) throw new ApiError(404, "Checkin not found");

    if (checkin.Status !== "ReportIn") {
        throw new ApiError(400, `Cannot reject — current status is ${checkin.Status}`);
    }

    const result = await prisma.$transaction(async (tx) => {

        // STEP 1: Update status to Rejected
        await tx.driver_Checkin.update({
            where: { Id: id },
            data: { Status: "Rejected" }
        });


        // STEP 2: Create rejection record
        const rejection = await tx.rejected_Vehicle.create({
            data: {
                Driver_Checkin_Id: id,
                Rejected_By: req.user.id,
                Reason: reason.trim(),
            }
        });

        // STEP 3: Decrement tokens for drivers after this one
        if (checkin.Token !== null && checkin.Token > 0) {
            await tx.driver_Checkin.updateMany({
                where: {
                    Status: "ReportIn",
                    Token: { gt: checkin.Token }
                },
                data: { Token: { decrement: 1 } }
            });

            await tx.driver_Checkin.update({
                where: { Id: id },
                data: { Token: 0 }
            });
        }

        return rejection;
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Vehicle rejected successfully")
    );
});


