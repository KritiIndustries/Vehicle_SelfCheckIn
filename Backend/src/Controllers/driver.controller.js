
import prisma from "../Config/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const uploadDoc = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { driverCheckinId, type } = req.body;

    if (!driverCheckinId || !type) {
        throw new ApiError(400, "Driver_Checkin_Id and document type required");
    }

    const checkinId = parseInt(driverCheckinId);

    // 1️⃣ Check if check-in exists
    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Id: checkinId },
    });

    if (!checkin) {
        throw new ApiError(404, "Driver check-in not found");
    }

    // 2️⃣ Check duplicate document for same ID + type
    const existingDoc = await prisma.driver_Documents.findFirst({
        where: {
            Driver_Checkin_Id: checkinId,
            Doc_Type: type,
        },
    });

    if (existingDoc) {
        throw new ApiError(409, "This ID already exists");
    }

    // 3️⃣ Insert document
    const document = await prisma.driver_Documents.create({
        data: {
            Driver_Checkin_Id: checkinId,
            Doc_Type: type,
            Image_Path: req.file.path,
            Verified: false,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, document, "Document inserted successfully"));
});
const allowedDocTypes = ["dl", "license", "rc", "insurance", "fitness"];

import fetchCsrfToken from "../services/fetchCsrfToken.service.js";
import insertZGP from "../utils/insertZGP.js";
import { deleteFromS3, uploadToS3 } from "../services/s3.service.js";
import { extractTextFromPdf, extractTextFromS3Url } from "../services/textract.service.js";
import { ensureImageQuality } from "../services/imageQuality.service.js";
import parseDrivingLicense from "../services/parsers/parseDrivingLicense.js";
import parseRC from "../services/parsers/parseRC.js";
import parseFitness from "../services/parsers/parseFitness.js";
import parseInsurance from "../services/parsers/parseInsurance.js";
import { formatIST } from "../services/dates.service.js";
import { cleanVehicleNo, extractVehicleNumbersFromSelfie } from "../services/extractVehicleNumberFromSelfie.js";



export const uploadTempDocument = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { sessionId, type } = req.body;

    if (!sessionId || !type) {
        throw new ApiError(400, "Session ID and document type required");
    }

    if (!allowedDocTypes.includes(type)) {
        throw new ApiError(400, "Invalid document type");
    }

    const existing = await prisma.driver_Temp_Upload.findFirst({
        where: {
            Session_Id: sessionId,
            Doc_Type: type,
            Is_Selfie: false,
        },
    });

    if (existing) {
        throw new ApiError(409, "Document already uploaded");
    }

    if (req.file.mimetype.startsWith("image/")) {
        await ensureImageQuality(req.file.buffer);
    }

    const url = await uploadToS3(req.file);

    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: type,
            Image_Path: url,
            Is_Selfie: false,
        },
    });

    return res.json(
        new ApiResponse(200, { fileUrl: url }, "Document uploaded")
    );
});

export const extractFieldsFromLines = (lines, type) => {

    if (type === "dl" || type === "license")
        return parseDrivingLicense(lines);

    if (type === "rc" || type === "vehicleRC" || type === "RC")
        return parseRC(lines);

    if (type === "insurance")
        return parseInsurance(lines);

    if (type === "fitness")
        return parseFitness(lines);

    return {};
};
export const uploadTempDocuments = asyncHandler(async (req, res) => {
    const { sessionId, doNumber } = req.body;
    // ✅ Validate required fields
    if (!sessionId || !doNumber) {
        throw new ApiError(400, "sessionId and doNumber are required");
    }
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }
    let types = req.body.types;

    if (typeof types === "string") {
        types = JSON.parse(types);
    }
    // const doExisting = await prisma.driver_Checkin.findFirst({
    //     where: {
    //         Do_No: doNumber
    //     }
    // })
    // if (doExisting) {
    //     throw new ApiError(409, "This DO number already exists");
    // }

    const uploaded = [];
    const ocrResults = {};

    for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const type = types[i];

        const url = await uploadToS3(file, doNumber, type);

        await prisma.driver_Temp_Upload.create({
            data: {
                Session_Id: sessionId,
                Doc_Type: type,
                Image_Path: url,
                Is_Selfie: false,
            },
        });

        uploaded.push({ type, url });

        // Only run Textract for image documents; skip PDFs and selfie.
        // if (type !== "selfie" && file.mimetype.startsWith("image/")) {
        //     const lines = await extractTextFromS3Url(url);
        //     const fields = extractFieldsFromLines(lines, type);
        //     ocrResults[type] = {
        //         lines,
        //         fields,
        //     };
        // }
        // it extact for Images and PDF s well.
        if (type !== "selfie") {
            let lines = [];

            if (file.mimetype.startsWith("image/")) {
                lines = await extractTextFromS3Url(url);  // existing logic
            }

            if (file.mimetype === "application/pdf") {
                lines = await extractTextFromPdf(url);
            }

            const fields = extractFieldsFromLines(lines, type);

            ocrResults[type] = {
                lines,
                fields
            };
        }
    }

    return res.json(
        new ApiResponse(
            200,
            { files: uploaded, ocr: ocrResults },
            "Documents uploaded"
        )
    );
});

export const uploadTempSelfie = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No selfie uploaded");
    }

    const { sessionId, doNumber, vehicleNo } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
        throw new ApiError(400, "Invalid sessionId");
    }

    if (!vehicleNo) {
        throw new ApiError(400, "Vehicle number required");
    }

    const existingSelfie = await prisma.driver_Temp_Upload.findFirst({
        where: {
            Session_Id: sessionId,
            Is_Selfie: true,
        },
    });

    if (existingSelfie) {
        // throw new ApiError(409, "सेल्फी पहले ही अपलोड हो चुकी है।");
        await prisma.driver_Temp_Upload.delete({
            where: { Id: existingSelfie.Id },
        });
        // Optional: delete old file from S3 too
        console.log("delete");

        await deleteFromS3(existingSelfie.Image_Path);
    }

    // ✅ Upload
    const url = await uploadToS3(req.file, doNumber, "selfie");

    if (!url) {
        throw new ApiError(500, "S3 upload failed");
    }

    // 🔥 DETECT ALL VEHICLE NUMBERS
    const detectedList = await extractVehicleNumbersFromSelfie(url);

    if (!detectedList.length) {
        throw new ApiError(
            400,
            "Number Plate  का पता नहीं चल पाया। कृपया सेल्फी ठीक से दोबारा लें।."
        );
    }

    const cleanExpected = cleanVehicleNo(vehicleNo);

    // 🔥 STRICT MATCH ONLY (PRODUCTION SAFE)
    // 🔥 FULL + PARTIAL MATCH SUPPORT
    const match = detectedList.find(v => {
        const cleanDetected = cleanVehicleNo(v);

        // ✅ full match
        if (cleanDetected === cleanExpected) return true;

        // ✅ prefix match (MH18AA matches MH18AA9822)
        if (cleanExpected.startsWith(cleanDetected)) return true;

        return false;
    });

    if (!match) {
        throw new ApiError(
            400,
            `आपकी आरसी में ट्रक नंबर और आपकी सेल्फी में ट्रक नंबर प्लेट एक जैसी नहीं हैं।. ${detectedList.join(", ")}`
        );
    }

    // ✅ SAVE
    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: "selfie",
            Image_Path: url,
            Is_Selfie: true,
            Created_At: new Date()
        },
    });

    return res.json(
        new ApiResponse(
            200,
            {
                fileUrl: url,
                detectedVehicleNo: match
            },
            "Selfie verified successfully"
        )
    );
});
export const finalizeCheckin = asyncHandler(async (req, res) => {
    const {
        sessionId,
        doNo,
        vehicleNo,
        driverName,
        mobile,
        lrNumber,
        documentDetails,
    } = req.body;

    const payload = {
        sessionId,
        doNo,
        vehicleNo,
        driverName,
        mobile,
        lrNumber,
    };
    //   console.log(payload);

    if (!sessionId || !doNo || !vehicleNo || !driverName || !mobile) {
        throw new ApiError(400, "कृपया सभी आवश्यक दस्तावेज़ अपलोड करें।");
    }

    const tempUploads = await prisma.driver_Temp_Upload.findMany({
        where: { Session_Id: sessionId },
    });

    if (tempUploads.length < 5) {
        throw new ApiError(400, "सभी दस्तावेज़ और सेल्फी आवश्यक हैं");
    }

    const requiredDocs = ["dl", "rc", "insurance", "fitness"];
    const uploadedTypes = tempUploads.map((d) => d.Doc_Type);

    for (const doc of requiredDocs) {
        if (!uploadedTypes.includes(doc)) {
            throw new ApiError(400, `${doc} missing`);
        }
    }

    if (!uploadedTypes.includes("selfie")) {
        throw new ApiError(400, "Selfie missing");
    }

    const existing = await prisma.driver_Checkin.findFirst({
        where: {
            Do_No: doNo,
        },
    });
    // const existing = await prisma.driver_Checkin.findFirst({
    //     where: {
    //         Vehicle_No: vehicleNo,
    //         Status: {
    //             in: ["CheckedIn", "Reportin"]
    //         }
    //     }
    // });

    if (existing) {
        throw new ApiError(409, "आप पहले ही  रिपोर्ट इन कर लिया है।");
    }
    const secondaryURL =
        "http://ktappdq.kritiindia.com:8010/sap/opu/odata/sap/ZGP_REGISTRATION_API_SRV/GatePassRegistrationSet";
    //TODO: Remove http://ktappdq.kritiindia.com:8010 port will be 1081 for development and 8010 for production. Make it dynamic based on environment variable
    // const tokenAndcookie = fetchCsrfToken(ZGPAPI_URL)

    const tokenAndcookie = await fetchCsrfToken(secondaryURL);

    const insertResult = await insertZGP(payload, tokenAndcookie);


    if (!insertResult || !insertResult.success) {
        throw new ApiError(
            500,
            insertResult?.message || "ZGP API failed or returned empty response"
        );
    }
    const data = {
        Do_No: doNo,
        Vehicle_No: vehicleNo,
        Driver_Name: driverName,
        Mobile: mobile,

        Licence_Expiry_Date: documentDetails?.dl?.expiryDate
            ? new Date(documentDetails.dl.expiryDate)
            : null,
        Insurance_Number: documentDetails?.insurance?.policyNo || null,
        Insurance_Expiry_Date: documentDetails?.insurance?.expiryDate
            ? new Date(documentDetails.insurance.expiryDate)
            : null,
        Chassis_Number: documentDetails?.rc?.chassisNo || null,
        Rc_Expiry_Date: documentDetails?.rc?.expiryDate
            ? new Date(documentDetails.rc.expiryDate)
            : null,
        Fitness_Expiry_Date: documentDetails?.fitness?.expiryDate
            ? new Date(documentDetails.fitness.expiryDate)
            : null,
        Status: "ReportIn",
        ReportIn_Time: new Date(),
        Zgp: "123456789" // insertResult.responseData?.Message || "N/A"

    }
    console.log("data ", data);


    // 🔥 TRANSACTION (Very Important)
    const result = await prisma.$transaction(async (tx) => {
        // ✅ Find last token assigned today and add 1
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const lastToken = await tx.driver_Checkin.findFirst({
            where: {
                ReportIn_Time: { gte: todayStart }
            },
            orderBy: { Token: "desc" },
            select: { Token: true }
        });
        const tokenNo = (lastToken?.Token ?? 0) + 1;
        // e.g. last token today = 5 → new token = 6
        // e.g. first driver today → last = null → 0 + 1 = 1

        const checkin = await tx.driver_Checkin.create({
            data: {
                Do_No: doNo,
                Vehicle_No: vehicleNo,
                Driver_Name: driverName,
                Mobile: mobile,
                Token: tokenNo, // ✅ stored
                Licence_Expiry_Date: documentDetails?.dl?.expiryDate
                    ? new Date(documentDetails.dl.expiryDate)
                    : null,

                Insurance_Number: documentDetails?.insurance?.policyNo ?? undefined,

                Insurance_Expiry_Date: documentDetails?.insurance?.expiryDate
                    ? new Date(documentDetails.insurance.expiryDate)
                    : null,

                Chassis_Number: documentDetails?.rc?.chassisNo ?? undefined,

                Rc_Expiry_Date: documentDetails?.rc?.expiryDate
                    ? new Date(documentDetails.rc.expiryDate)
                    : null,

                Fitness_Expiry_Date: documentDetails?.fitness?.expiryDate
                    ? new Date(documentDetails.fitness.expiryDate)
                    : null,

                Status: "ReportIn",

                // ✅ FIX HERE
                ReportIn_Time: new Date(),

                Zgp: insertResult.responseData?.Message || "N/A",
            },
        });


        // for (const upload of tempUploads) {
        //     await tx.driver_Documents.create({
        //         data: {
        //             Driver_Checkin_Id: checkin.Id,
        //             Doc_Type: upload.Doc_Type,
        //             Image_Path: upload.Image_Path,
        //             Verified: false
        //         }
        //     });
        // }
        const expiryMap = {
            dl: documentDetails?.dl?.expiryDate,
            rc: documentDetails?.rc?.expiryDate,
            insurance: documentDetails?.insurance?.expiryDate,
            fitness: documentDetails?.fitness?.expiryDate
        };

        for (const upload of tempUploads) {

            const expiryDate = expiryMap[upload.Doc_Type]
                ? new Date(expiryMap[upload.Doc_Type])
                : null;

            await tx.driver_Documents.create({
                data: {
                    Driver_Checkin_Id: checkin.Id,
                    Doc_Type: upload.Doc_Type,
                    Image_Path: upload.Image_Path,
                    Expiry_Date: expiryDate,
                    Verified: false
                }
            });
        }

        await tx.driver_Temp_Upload.deleteMany({
            where: { Session_Id: sessionId }
        });

        return checkin;
    });
    return res
        .status(201)
        .json(new ApiResponse(201, result, "Check-in successful"));
});

export const validatePage = asyncHandler(async (req, res) => {
    const DO = req.params.do;
    const entry = await prisma.driver_Checkin.findFirst({
        where: {
            Do_No: DO,
            Status: {
                not: "CheckedOut"
            }
        },
    });
    if (!entry) throw new ApiError(404, "Details not found");

    return res.status(200).json(new ApiResponse(200, entry, "Details found"));
})