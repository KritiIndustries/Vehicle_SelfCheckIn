
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

// export const uploadTempDocument = asyncHandler(async (req, res) => {

//     if (!req.file) {
//         throw new ApiError(400, "No file uploaded");
//     }

//     const { sessionId, type } = req.body;

//     if (!sessionId || !type) {
//         throw new ApiError(400, "Session ID and document type required");
//     }

//     if (!allowedDocTypes.includes(type)) {
//         throw new ApiError(400, "Invalid document type");
//     }

//     // Prevent duplicate in temp
//     const existing = await prisma.driver_Temp_Upload.findFirst({
//         where: {
//             Session_Id: sessionId,
//             Doc_Type: type,
//             Is_Selfie: false
//         }
//     });

//     if (existing) {
//         throw new ApiError(409, "Document already uploaded");
//     }

//     await prisma.driver_Temp_Upload.create({
//         data: {
//             Session_Id: sessionId,
//             Doc_Type: type,
//             Image_Path: req.file.path,
//             Is_Selfie: false
//         }
//     });

//     return res.json(
//         new ApiResponse(200, null, "Document uploaded")
//     );
// });
// export const uploadTempSelfie = asyncHandler(async (req, res) => {

//     if (!req.file) {
//         throw new ApiError(400, "No selfie uploaded");
//     }

//     const { sessionId } = req.body;

//     if (!sessionId) {
//         throw new ApiError(400, "Session ID required");
//     }

//     // Only one selfie allowed
//     const existingSelfie = await prisma.driver_Temp_Upload.findFirst({
//         where: {
//             Session_Id: sessionId,
//             Is_Selfie: true
//         }
//     });

//     if (existingSelfie) {
//         throw new ApiError(409, "Selfie already uploaded");
//     }

//     await prisma.driver_Temp_Upload.create({
//         data: {
//             Session_Id: sessionId,
//             Doc_Type: "selfie",
//             Image_Path: req.file.path,
//             Is_Selfie: true
//         }
//     });

//     return res.json(
//         new ApiResponse(200, null, "Selfie uploaded")
//     );
// });

// export const finalizeCheckin = asyncHandler(async (req, res) => {

//     const { sessionId, doNo, vehicleNo, driverName, mobile } = req.body;
//     console.log(sessionId);
//     console.log(doNo, vehicleNo, driverName, mobile);

//     if (!sessionId || !doNo || !vehicleNo || !driverName || !mobile) {
//         throw new ApiError(400, "Missing required fields");
//     }

//     const tempUploads = await prisma.driver_Temp_Upload.findMany({
//         where: { Session_Id: sessionId }
//     });

//     if (tempUploads.length < 5) {
//         throw new ApiError(400, "All documents and selfie required");
//     }

//     const requiredDocs = ["dl", "rc", "insurance", "fitness"];
//     const uploadedTypes = tempUploads.map(d => d.Doc_Type);

//     for (const doc of requiredDocs) {
//         if (!uploadedTypes.includes(doc)) {
//             throw new ApiError(400, `${doc} missing`);
//         }
//     }

//     if (!uploadedTypes.includes("selfie")) {
//         throw new ApiError(400, "Selfie missing");
//     }

//     // Prevent duplicate check-in
//     const existing = await prisma.driver_Checkin.findFirst({
//         where: {
//             Do_No: doNo,
//             Vehicle_No: vehicleNo,
//             Status: "CheckedIn"
//         }
//     });

//     if (existing) {
//         throw new ApiError(409, "Driver already checked-in");
//     }

//     // Create DRIVER_CHECKIN
//     const checkin = await prisma.driver_Checkin.create({
//         data: {
//             Do_No: doNo,
//             Vehicle_No: vehicleNo,
//             Driver_Name: driverName,
//             Mobile: mobile,
//             Status: "CheckedIn",
//             Entry_Time: new Date()
//         }
//     });

//     // Move documents
//     for (const upload of tempUploads) {
//         await prisma.driver_Documents.create({
//             data: {
//                 Driver_Checkin_Id: checkin.Id,
//                 Doc_Type: upload.Doc_Type,
//                 Image_Path: upload.Image_Path,
//                 Verified: false
//             }
//         });
//     }

//     // Cleanup temp
//     await prisma.driver_Temp_Upload.deleteMany({
//         where: { Session_Id: sessionId }
//     });

//     return res.status(201).json(
//         new ApiResponse(201, checkin, "Check-in successful")
//     );
// });

import fetchCsrfToken from "../services/fetchCsrfToken.service.js";
import { ZGPAPI_URL } from "../constants.js";
import insertZGP from "../utils/insertZGP.js";
import { uploadToS3 } from "../services/s3.service.js";
import { extractTextFromPdf, extractTextFromS3Url } from "../services/textract.service.js";
import { ensureImageQuality } from "../services/imageQuality.service.js";
import parseDrivingLicense from "../services/parsers/parseDrivingLicense.js";
import parseRC from "../services/parsers/parseRC.js";
import parseFitness from "../services/parsers/parseFitness.js";
import parseInsurance from "../services/parsers/parseInsurance.js";

// export const uploadTempDocument = asyncHandler(async (req, res) => {
//     if (!req.file) {
//         throw new ApiError(400, "No file uploaded");
//     }

//     const { sessionId, type } = req.body;

//     if (!sessionId || !type) {
//         throw new ApiError(400, "Session ID and document type required");
//     }

//     if (!allowedDocTypes.includes(type)) {
//         throw new ApiError(400, "Invalid document type");
//     }

//     const existing = await prisma.driver_Temp_Upload.findFirst({
//         where: {
//             Session_Id: sessionId,
//             Doc_Type: type,
//             Is_Selfie: false,
//         },
//     });

//     if (existing) {
//         throw new ApiError(409, "Document already uploaded");
//     }

//     // 🔥 Save file manually
//     const filePath = await saveFileLocally(req.file);
//     console.log("Ready To Upload");

//     const url = await uploadToS3(req.file);
//     console.log("URL", url);

//     if (url) {
//         console.log("Uploading");

//         return res.json(new ApiResponse(200, { fileUrl: url }, "Document uploaded"));
//     }

//     await prisma.driver_Temp_Upload.create({
//         data: {
//             Session_Id: sessionId,
//             Doc_Type: type,
//             Image_Path: filePath,
//             Is_Selfie: false,
//         },
//     });

//     return res.json(new ApiResponse(200, { fileUrl: url }, "Document uploaded"));
// });


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

// export const uploadTempDocuments = asyncHandler(async (req, res) => {
//     // Expecting multipart/form-data with files under `documents` and a `types` field
//     // `types` should be an array (or JSON string) matching the order of files: ["dl","rc","insurance","fitness"]
//     if (!req.files || req.files.length === 0) {
//         throw new ApiError(400, "No files uploaded");
//     }

//     const { sessionId } = req.body;

//     if (!sessionId) {
//         throw new ApiError(400, "Session ID required");
//     }

//     let types = req.body.types;

//     if (!types) {
//         throw new ApiError(400, "Types array required");
//     }

//     if (typeof types === "string") {
//         // try JSON parse, else split by comma
//         try {
//             types = JSON.parse(types);
//         } catch (e) {
//             types = types.split(",").map((t) => t.trim()).filter(Boolean);
//         }
//     }

//     if (!Array.isArray(types) || types.length !== req.files.length) {
//         throw new ApiError(400, "Types count must match number of uploaded files");
//     }

//     const uploaded = [];

//     for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const type = types[i];

//         if (!allowedDocTypes.includes(type)) {
//             throw new ApiError(400, `Invalid document type: ${type}`);
//         }

//         // Prevent duplicate in temp
//         const existing = await prisma.driver_Temp_Upload.findFirst({
//             where: {
//                 Session_Id: sessionId,
//                 Doc_Type: type,
//                 Is_Selfie: false,
//             },
//         });

//         if (existing) {
//             throw new ApiError(409, `Document already uploaded: ${type}`);
//         }

//         // Upload to S3 (sequential as requested)
//         const url = await uploadToS3(file);

//         await prisma.driver_Temp_Upload.create({
//             data: {
//                 Session_Id: sessionId,
//                 Doc_Type: type,
//                 Image_Path: url,
//                 Is_Selfie: false,
//             },
//         });

//         uploaded.push({ type, url });
//     }

//     return res.json(new ApiResponse(200, { files: uploaded }, "Documents uploaded"));
// });


const parseDate = (value) => {
    if (!value || typeof value !== "string") return null;

    // Support formats like DD-MM-YYYY or DD/MM/YYYY
    const parts = value.split(/[-/.\s]+/).filter(Boolean);
    if (parts.length === 3) {
        const [d, m, y] = parts.map((p) => parseInt(p, 10));
        if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
            const year = y < 100 ? 2000 + y : y;
            return new Date(year, m - 1, d);
        }
    }

    const direct = new Date(value);
    return Number.isNaN(direct.getTime()) ? null : direct;
};

// const extractFieldsFromLines = (lines = [], type) => {
//     const text = lines.join(" ");
//     const dateMatch = text.match(/\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/);
//     const firstDate = dateMatch ? dateMatch[1] : null;

//     if (type === "dl" || type === "license") {
//         const licenseMatch =
//             text.match(/[A-Z]{2}\d{2}[A-Z0-9\-\/]*\d+/) ||
//             text.match(/[A-Z0-9]+[-/][A-Z0-9\-\/]+/);

//         const nameLine =
//             lines.find((l) => /name/i.test(l)) ||
//             lines.find((l) => /^[A-Z ]{3,}$/.test(l.trim()));

//         return {
//             documentType: "drivingLicense",
//             licenseNo: licenseMatch ? licenseMatch[0] : null,
//             name: nameLine ? nameLine.replace(/name[:\-]*/i, "").trim() : null,
//             expiryDate: firstDate,
//         };
//     }

//     if (type === "insurance") {
//         const policyMatch = text.match(/\b[PA]\w{5,}\b/);

//         return {
//             documentType: "insurance",
//             policyNo: policyMatch ? policyMatch[0] : null,
//             expiryDate: firstDate,
//         };
//     }

//     if (type === "rc") {
//         const vehicleMatch = text.match(
//             /\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b/
//         );
//         const chassisMatch = text.match(/\b[0-9A-Z]{10,}\b/);

//         return {
//             documentType: "vehicleRC",
//             vehicleNo: vehicleMatch ? vehicleMatch[0] : null,
//             chassisNo: chassisMatch ? chassisMatch[0] : null,
//             expiryDate: firstDate,
//         };
//     }

//     if (type === "fitness") {
//         return {
//             documentType: "fitness",
//             expiryDate: firstDate,
//         };
//     }

//     return {
//         documentType: type,
//     };
// };


// const extractFieldsFromLines = (lines = [], type) => {

//     const text = lines.join(" ").toUpperCase();

//     const dateRegex = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g;
//     const dates = [...text.matchAll(dateRegex)].map(d => parseDate(d[1]));

//     if (type === "dl" || type === "license") {

//         const licenseRegex =
//             /\b[A-Z]{2}\d{2}[A-Z]?[- ]?\d{4}[- ]?\d{7}\b|\bDL\d{10,}\b/;

//         const licenseNo = text.match(licenseRegex)?.[0] || null;

//         const nameLine =
//             lines.find(l => /NAME/i.test(l)) ||
//             lines.find(l =>
//                 /^[A-Z\s]{5,}$/.test(l.trim()) &&
//                 !l.includes("LICENCE") &&
//                 !l.includes("GOVERNMENT")
//             );

//         return {
//             documentType: "drivingLicense",
//             name: nameLine ? nameLine.replace(/NAME[:\-]*/i, "").trim() : null,
//             licenseNo,
//             expiryDate: dates[1] || dates[0] || null
//         };
//     }

//     if (type === "rc") {

//         const vehicleRegex =
//             /\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b/;

//         const chassisRegex =
//             /\b[A-HJ-NPR-Z0-9]{16,17}\b/;

//         return {
//             documentType: "vehicleRC",
//             vehicleNo: text.match(vehicleRegex)?.[0] || null,
//             chassisNo: text.match(chassisRegex)?.[0] || null,
//             expiryDate: dates[0] || null
//         };
//     }

//     if (type === "insurance") {

//         const policyRegex =
//             /\b[A-Z0-9]{6,20}\b/;

//         return {
//             documentType: "insurance",
//             policyNo: text.match(policyRegex)?.[0] || null,
//             expiryDate: dates[0] || null
//         };
//     }

//     if (type === "fitness") {

//         return {
//             documentType: "fitness",
//             expiryDate: dates[0] || null
//         };
//     }

//     return {};
// };


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

    let types = req.body.types;
    if (typeof types === "string") {
        types = JSON.parse(types);
    }

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

    const { sessionId, doNumber } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
        throw new ApiError(400, "Invalid sessionId");
    }

    const existingSelfie = await prisma.driver_Temp_Upload.findFirst({
        where: {
            Session_Id: sessionId,
            Is_Selfie: true,
        },
    });

    if (existingSelfie) {
        throw new ApiError(409, "सेल्फी पहले ही अपलोड हो चुकी है।");
    }

    // if (req.file.mimetype.startsWith("image/")) {
    //     await ensureImageQuality(req.file.buffer);
    // }

    // Upload selfie to S3 and store URL
    const url = await uploadToS3(req.file, doNumber, "selfie");
    if (!url) {
        throw new ApiError(500, "S3 upload failed");
    }

    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: "selfie",
            Image_Path: url,
            Is_Selfie: true,
            Created_At: new Date()
        },
    });

    return res.json(new ApiResponse(200, { fileUrl: url }, "Selfie uploaded"));
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
    console.log("insertResult", insertResult);

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
      
        const checkin = await tx.driver_Checkin.create({
            data: {
                Do_No: doNo,
                Vehicle_No: vehicleNo,
                Driver_Name: driverName,
                Mobile: mobile,
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
                ReportIn_Time: new Date(),
                Zgp: insertResult.responseData?.Message || "N/A",
            },
        });

        for (const upload of tempUploads) {
            await tx.driver_Documents.create({
                data: {
                    Driver_Checkin_Id: checkin.Id,
                    Doc_Type: upload.Doc_Type,
                    Image_Path: upload.Image_Path,
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
