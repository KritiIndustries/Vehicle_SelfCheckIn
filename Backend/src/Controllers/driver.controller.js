// // const allowedDocTypes = [
// //     "dl",
// //     "rc",
// //     "insurance",
// //     "fitness",
// // ];

// // export const uploadDoc = async (req, res) => {
// //     try {
// //         if (!req.file) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "No file uploaded",
// //             });
// //         }

// //         const { driverCheckinId, type, latitude, longitude } = req.body;

// //         if (!driverCheckinId || !type) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Driver_Checkin_Id and type required",
// //             });
// //         }

// //         if (!allowedDocTypes.includes(type)) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Invalid document type",
// //             });
// //         }

// //         // 1️⃣ Verify Driver_Checkin exists
// //         const checkin = await prisma.driver_Checkin.findUnique({
// //             where: { Id: parseInt(driverCheckinId) },
// //         });

// //         if (!checkin) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "Driver check-in not found",
// //             });
// //         }

// //         // 2️⃣ Optional: enforce plant geo check again here if needed

// //         // 3️⃣ Save Document
// //         const document = await prisma.driver_Documents.create({
// //             data: {
// //                 Driver_Checkin_Id: checkin.Id,
// //                 Doc_Type: type,
// //                 Image_Path: req.file.path,
// //                 Verified: false,
// //             },
// //         });

// //         return res.status(201).json({
// //             success: true,
// //             message: "Document uploaded successfully",
// //             data: document,
// //         });

// //     } catch (error) {
// //         console.error("UploadDoc Error:", error);

// //         return res.status(500).json({
// //             success: false,
// //             message: "Document upload failed",
// //         });
// //     }
// // };

// import prisma from "../Config/index.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/ApiResponse.js";

// const requiredDocTypes = ["dl", "rc", "insurance", "fitness"];

// export const uploadDoc = asyncHandler(async (req, res) => {

//     if (!req.file) {
//         throw new ApiError(400, "No file uploaded");
//     }

//     const { token, type, latitude, longitude } = req.body;

//     if (!type) {
//         throw new ApiError(400, "Token and document type required");
//     }

//     if (!requiredDocTypes.includes(type)) {
//         throw new ApiError(400, "Invalid document type");
//     }

//     // 1️⃣ Find checkin using secure token
//     const checkin = await prisma.driver_Checkin.findUnique({
//         where: { Token: token },
//         include: { Documents: true },
//     });

//     if (!checkin) {
//         throw new ApiError(404, "Invalid check-in token");
//     }

//     // 2️⃣ Prevent upload if already completed
//     if (checkin.Status !== "Pending") {
//         throw new ApiError(400, "Upload not allowed after check-in completion");
//     }

//     // 3️⃣ Prevent duplicate document type
//     const duplicate = checkin.Documents.find(
//         (doc) => doc.Doc_Type === type
//     );

//     if (duplicate) {
//         throw new ApiError(409, "Document already uploaded");
//     }

//     // 4️⃣ Store GPS (only first time or update)
//     if (latitude && longitude) {
//         await prisma.driver_Checkin.update({
//             where: { Id: checkin.Id },
//             data: {
//                 Latitude: parseFloat(latitude),
//                 Longitude: parseFloat(longitude),
//             },
//         });
//     }

//     // 5️⃣ Save document
//     await prisma.driver_Documents.create({
//         data: {
//             Driver_Checkin_Id: checkin.Id,
//             Doc_Type: type,
//             Image_Path: req.file.path,
//             Verified: false,
//         },
//     });

//     // 6️⃣ Check if all required documents uploaded
//     const updatedDocs = await prisma.driver_Documents.findMany({
//         where: { Driver_Checkin_Id: checkin.Id },
//     });

//     const uploadedTypes = updatedDocs.map((d) => d.Doc_Type);

//     const allUploaded = requiredDocTypes.every((docType) =>
//         uploadedTypes.includes(docType)
//     );

//     if (allUploaded) {
//         await prisma.driver_Checkin.update({
//             where: { Id: checkin.Id },
//             data: {
//                 Status: "CheckedIn",
//                 Entry_Time: new Date(),
//             },
//         });
//     }

//     return res.status(201).json(
//         new ApiResponse(
//             201,
//             {
//                 checkinId: checkin.Id,
//                 status: allUploaded ? "CheckedIn" : "Pending"
//             },
//             allUploaded
//                 ? "All documents uploaded. Driver checked in."
//                 : "Document uploaded successfully"
//         )
//     );
// });

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

export const uploadTempDocuments = asyncHandler(async (req, res) => {
    // Expecting multipart/form-data with files under `documents` and a `types` field
    // `types` should be an array (or JSON string) matching the order of files: ["dl","rc","insurance","fitness"]
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        throw new ApiError(400, "Session ID required");
    }

    let types = req.body.types;

    if (!types) {
        throw new ApiError(400, "Types array required");
    }

    if (typeof types === "string") {
        // try JSON parse, else split by comma
        try {
            types = JSON.parse(types);
        } catch (e) {
            types = types.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }

    if (!Array.isArray(types) || types.length !== req.files.length) {
        throw new ApiError(400, "Types count must match number of uploaded files");
    }

    const uploaded = [];

    for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const type = types[i];

        if (!allowedDocTypes.includes(type)) {
            throw new ApiError(400, `Invalid document type: ${type}`);
        }

        // Prevent duplicate in temp
        const existing = await prisma.driver_Temp_Upload.findFirst({
            where: {
                Session_Id: sessionId,
                Doc_Type: type,
                Is_Selfie: false,
            },
        });

        if (existing) {
            throw new ApiError(409, `Document already uploaded: ${type}`);
        }

        // Upload to S3 (sequential as requested)
        const url = await uploadToS3(file);

        await prisma.driver_Temp_Upload.create({
            data: {
                Session_Id: sessionId,
                Doc_Type: type,
                Image_Path: url,
                Is_Selfie: false,
            },
        });

        uploaded.push({ type, url });
    }

    return res.json(new ApiResponse(200, { files: uploaded }, "Documents uploaded"));
});
export const uploadTempSelfie = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No selfie uploaded");
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        throw new ApiError(400, "Session ID required");
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

    // Upload selfie to S3 and store URL
    const url = await uploadToS3(req.file);

    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: "selfie",
            Image_Path: url,
            Is_Selfie: true,
        },
    });

    return res.json(new ApiResponse(200, { fileUrl: url }, "Selfie uploaded"));
});

export const finalizeCheckin = asyncHandler(async (req, res) => {
    const { sessionId, doNo, vehicleNo, driverName, mobile, lrNumber } = req.body;
    const payload = {
        sessionId,
        doNo,
        vehicleNo,
        driverName,
        mobile,
        lrNumber
    };
    //   console.log(payload);

    if (!sessionId || !doNo || !vehicleNo || !driverName || !mobile) {
        throw new ApiError(400, "कृपया सभी आवश्यक दस्तावेज़ अपलोड करें।");
    }

    const tempUploads = await prisma.driver_Temp_Upload.findMany({
        where: { Session_Id: sessionId },
    });

    if (tempUploads.length < 5) {
        throw new ApiError(400, "All documents and selfie required");
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

    // 🔥 TRANSACTION (Very Important)
    // const result = await prisma.$transaction(async (tx) => {
    //     const checkin = await tx.driver_Checkin.create({
    //         data: {
    //             Do_No: doNo,
    //             Vehicle_No: vehicleNo,
    //             Driver_Name: driverName,
    //             Mobile: mobile,
    //             Status: "CheckedIn",
    //             Entry_Time: new Date(),
    //             Zgp: insertResult.responseData.Message || "N/A"
    //         }
    //     });

    //     for (const upload of tempUploads) {
    //         await tx.driver_Documents.create({
    //             data: {
    //                 Driver_Checkin_Id: checkin.Id,
    //                 Doc_Type: upload.Doc_Type,
    //                 Image_Path: upload.Image_Path,
    //                 Verified: false
    //             }
    //         });
    //     }

    //     await tx.driver_Temp_Upload.deleteMany({
    //         where: { Session_Id: sessionId }
    //     });

    //     return checkin;
    // });
    const result = await prisma.$transaction(async (tx) => {
        const checkin = await tx.driver_Checkin.create({
            data: {
                Do_No: doNo,
                Vehicle_No: vehicleNo,
                Driver_Name: driverName,
                Mobile: mobile,
                Status: "CheckedIn",
                Entry_Time: new Date(),
                Zgp: insertResult.responseData?.Message || "N/A",
            },
        });

        await tx.driver_Documents.createMany({
            data: tempUploads.map((upload) => ({
                Driver_Checkin_Id: checkin.Id,
                Doc_Type: upload.Doc_Type,
                Image_Path: upload.Image_Path,
                Verified: false,
            })),
        });

        await tx.driver_Temp_Upload.deleteMany({
            where: { Session_Id: sessionId },
        });

        return checkin;
    });

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Check-in successful"));
});
