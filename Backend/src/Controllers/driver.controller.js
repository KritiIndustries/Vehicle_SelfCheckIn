
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
import { cleanVehicleNo, extractVehicleNumbersFromSelfie, extractVehiclePrefixesFromSelfie, getVehiclePrefix, getVehicleStateRTO } from "../services/extractVehicleNumberFromSelfie.js";



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
    console.log("types ", types);


    if (typeof types === "string") {
        types = JSON.parse(types);
    }
    // if (!allowedDocTypes.includes(types)) {
    //     throw new ApiError(400, "Invalid document type");
    // }

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

        // ✅ Check if doc already exists for this session + type
        const existing = await prisma.driver_Temp_Upload.findFirst({
            where: {
                Session_Id: sessionId,
                Doc_Type: type,
            }
        });

        if (existing) {
            // ✅ Delete from S3
            try {
                await deleteFromS3(existing.Image_Path);
            } catch (s3Err) {
                console.error(`S3 delete failed for ${type}:`, s3Err.message);
                // continue even if S3 delete fails
            }

            // ✅ Delete from DB
            await prisma.driver_Temp_Upload.delete({
                where: { Id: existing.Id }
            });
        }

        // ✅ Upload new file to S3
        const url = await uploadToS3(file, doNumber, type);

        // ✅ Save to DB
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

    const { sessionId, doNumber, vehicleNo, manualVehicleNo } = req.body;
    const effectiveVehicleNo = (manualVehicleNo || vehicleNo || "").trim();

    if (!sessionId || typeof sessionId !== "string") {
        throw new ApiError(400, "Invalid sessionId");
    }

    if (!effectiveVehicleNo) {
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

    if (manualVehicleNo) {
        // Manual fallback: accept the selfie with the entered vehicle number.
        await prisma.driver_Temp_Upload.create({
            data: {
                Session_Id: sessionId,
                Doc_Type: "selfie",
                Image_Path: url,
                Is_Selfie: true,
                Created_At: new Date(),
            },
        });

        return res.json(
            new ApiResponse(
                200,
                {
                    fileUrl: url,
                    detectedVehicleNo: effectiveVehicleNo,
                    manualVehicleNo: effectiveVehicleNo,
                },
                "Selfie uploaded with manual vehicle number"
            )
        );
    }

    // 🔥 DETECT ALL VEHICLE NUMBERS
    // const detectedList = await extractVehicleNumbersFromSelfie(url);
    const detectedList = await extractVehiclePrefixesFromSelfie(url);

    if (!detectedList.length) {
        throw new ApiError(
            400,
            "Number Plate  का पता नहीं चल पाया। कृपया सेल्फी ठीक से दोबारा लें।."
        );
    }

    // const cleanExpected = cleanVehicleNo(vehicleNo);

    // // 🔥 STRICT MATCH ONLY (PRODUCTION SAFE)
    // // 🔥 FULL + PARTIAL MATCH SUPPORT
    // const match = detectedList.find(v => {
    //     const cleanDetected = cleanVehicleNo(v);

    //     // ✅ full match
    //     if (cleanDetected === cleanExpected) return true;

    //     // ✅ prefix match (MH18AA matches MH18AA9822)
    //     if (cleanExpected.startsWith(cleanDetected)) return true;

    //     return false;
    // });
    //matching on prefix is starting 6 digits

    //Ignoring last 4 characters
    // const expectedPrefix = getVehiclePrefix(vehicleNo);

    // const match = detectedList.find(v => {
    //     const detectedPrefix = getVehiclePrefix(v);

    //     console.log({
    //         detected: detectedPrefix,
    //         expected: expectedPrefix
    //     });

    //     return detectedPrefix === expectedPrefix;
    // });
    //Get strarting 4 characters as prefix and match with expected prefix
    const expectedPrefix = getVehicleStateRTO(vehicleNo);

    const match = detectedList.find(
        prefix => prefix === expectedPrefix
    );

    if (!match) {
        throw new ApiError(
            400,
            `आपकी आरसी में ट्रक नंबर और आपकी सेल्फी में ट्रक नंबर प्लेट एक जैसी नहीं हैं।.}`
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
        sourceCheckinId,
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

    const sourceDocuments = sourceCheckinId
        ? await prisma.driver_Documents.findMany({
            where: {
                Driver_Checkin_Id: Number(sourceCheckinId),
                Driver_Checkin: {
                    Vehicle_No: vehicleNo,
                    Status: { not: "Rejected" },
                },
                Doc_Type: { in: ["dl", "rc", "insurance", "fitness"] },
            },
        })
        : [];

    const documentUploads = tempUploads.length === 1 && sourceDocuments.length > 0
        ? [...sourceDocuments.map((document) => ({
            Doc_Type: document.Doc_Type,
            Image_Path: document.Image_Path,
            Expiry_Date: document.Expiry_Date,
            Is_Selfie: false,
        })), ...tempUploads]
        : tempUploads;

    if (documentUploads.length < 5) {
        throw new ApiError(400, "सभी दस्तावेज़ और सेल्फी आवश्यक हैं");
    }

    const requiredDocs = ["dl", "rc", "insurance", "fitness"];
    const uploadedTypes = documentUploads.map((d) => d.Doc_Type);

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
            Status: {
                not: 'Rejected',
            },
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
        `${process.env.SAP_BASE_URL}/ZGP_REGISTRATION_API_SRV/GatePassRegistrationSet`;
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
                License_Number: documentDetails?.dl?.licenseNo ?? undefined,
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
        if (checkin) {
            // ✅ Get edited data from frontend
            const editedDocs = req.body.editedDocs || [];

            for (const edit of editedDocs) {
                // find matching document
                const doc = await tx.driver_Documents.findFirst({
                    where: {
                        Driver_Checkin_Id: checkin.Id,
                        Doc_Type: edit.docType.toLowerCase()
                    }
                });

                await tx.edited_Documents.create({
                    data: {
                        Driver_Checkin_Id: checkin.Id,
                        Driver_Document_Id: doc?.Id || null,
                        Doc_Type: edit.docType,
                        Edited_Fields: edit.editedFields,
                        Image_Path: edit.imagePath ?? null
                    }
                });
            }
        }


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

        for (const upload of documentUploads) {

            const expiryDate = expiryMap[upload.Doc_Type]
                ? new Date(expiryMap[upload.Doc_Type])
                : upload.Expiry_Date || null;

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
                not: "Rejected"
            }
        },
    });
    if (!entry) throw new ApiError(404, "Details not found");

    return res.status(200).json(new ApiResponse(200, entry, "Details found"));
})

export const lookupVehicle = asyncHandler(async (req, res) => {
    const vehicleNo = req.params.vehicleNo?.trim();

    if (!vehicleNo) {
        throw new ApiError(400, "Vehicle number is required");
    }

    const entry = await prisma.driver_Checkin.findFirst({
        where: {
            Vehicle_No: vehicleNo,
            Status: { not: "Rejected" },
        },
        orderBy: { Created_At: "desc" },
        include: {
            Documents: {
                where: { Doc_Type: { in: ["dl", "rc", "insurance", "fitness"] } },
                orderBy: { Created_At: "desc" },
            },
        },
    });

    if (!entry) {
        return res.status(200).json(new ApiResponse(200, { found: false }, "Vehicle not found"));
    }

    return res.status(200).json(new ApiResponse(200, {
        found: true,
        sourceCheckinId: entry.Id,
        fields: {
            dl: {
                name: entry.Driver_Name || "",
                licenseNo: entry.License_Number || "",
                expiryDate: entry.Licence_Expiry_Date?.toISOString().slice(0, 10) || "",
            },
            insurance: {
                policyNo: entry.Insurance_Number || "",
                expiryDate: entry.Insurance_Expiry_Date?.toISOString().slice(0, 10) || "",
            },
            rc: {
                vehicleNo: entry.Vehicle_No || "",
                chassisNo: entry.Chassis_Number || "",
                expiryDate: entry.Rc_Expiry_Date?.toISOString().slice(0, 10) || "",
            },
            fitness: {
                expiryDate: entry.Fitness_Expiry_Date?.toISOString().slice(0, 10) || "",
            },
        },
    }, "Vehicle found"));
});
export const uploadSingleDocument = asyncHandler(async (req, res) => {
    const { sessionId, doNumber, type } = req.body;

    if (!sessionId || !doNumber || !type) {
        throw new ApiError(400, "sessionId, doNumber, type required");
    }

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    try {
        const file = req.file;
        // ✅ 1. GET OLD RECORD (before overwrite)
        const existingDoc = await prisma.driver_Temp_Upload.findFirst({
            where: {
                Session_Id: sessionId,
                Doc_Type: type,
            },
        });


        // ✅ 2. UPLOAD NEW FILE FIRST (SAFE)
        const url = await uploadToS3(file, doNumber, type);

        // ✅ 3. UPSERT DB
        // ✅ 3. UPDATE OR CREATE
        if (existingDoc) {
            await prisma.driver_Temp_Upload.update({
                where: { Id: existingDoc.Id },
                data: { Image_Path: url },
            });
        } else {
            await prisma.driver_Temp_Upload.create({
                data: {
                    Session_Id: sessionId,
                    Doc_Type: type,
                    Image_Path: url,
                    Is_Selfie: false,
                },
            });
        }

        // ✅ 4. DELETE OLD FILE AFTER SUCCESS
        if (existingDoc?.Image_Path) {
            await deleteFromS3(existingDoc.Image_Path);
        }

        // ✅ 5. OCR
        let lines = [];

        if (type !== "selfie") {
            if (file.mimetype.startsWith("image/")) {
                lines = await extractTextFromS3Url(url);
            } else if (file.mimetype === "application/pdf") {
                lines = await extractTextFromPdf(url);
            }
        }

        const fields = extractFieldsFromLines(lines, type);

        return res.json(new ApiResponse(200, {
            file: { type, url },
            ocr: { lines, fields }
        }, `${type} uploaded successfully`));

    } catch (error) {
        throw new ApiError(500, `${type} upload failed: ${error.message}`);
    }
});

// Save edited document fields submitted by user (from DocumentReview)
export const saveEditedDocument = asyncHandler(async (req, res) => {
    const { driverCheckinId, driverDocumentId, docType, editedFields, imagePath } = req.body;

    if (!docType || !editedFields) {
        throw new ApiError(400, "docType and editedFields are required");
    }

    // driverCheckinId optional, but prefer numeric if provided
    const checkinId = driverCheckinId ? Number(driverCheckinId) : null;
    const docId = driverDocumentId ? Number(driverDocumentId) : null;

    const record = await prisma.edited_Documents.create({
        data: {
            Driver_Checkin_Id: checkinId ?? undefined,
            Driver_Document_Id: docId ?? undefined,
            Doc_Type: docType,
            Edited_Fields: editedFields,
            Image_Path: imagePath ?? undefined,
        },
    });

    return res.status(201).json(new ApiResponse(201, record, "Edited document saved"));
});