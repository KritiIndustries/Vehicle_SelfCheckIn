

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
        where: { Id: checkinId }
    });

    if (!checkin) {
        throw new ApiError(404, "Driver check-in not found");
    }

    // 2️⃣ Check duplicate document for same ID + type
    const existingDoc = await prisma.driver_Documents.findFirst({
        where: {
            Driver_Checkin_Id: checkinId,
            Doc_Type: type
        }
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
            Verified: false
        }
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            document,
            "Document inserted successfully"
        )
    );
});



const allowedDocTypes = ["dl", "rc", "insurance", "fitness"];

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

    // Prevent duplicate in temp
    const existing = await prisma.driver_Temp_Upload.findFirst({
        where: {
            Session_Id: sessionId,
            Doc_Type: type,
            Is_Selfie: false
        }
    });

    if (existing) {
        throw new ApiError(409, "Document already uploaded");
    }

    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: type,
            Image_Path: req.file.path,
            Is_Selfie: false
        }
    });

    return res.json(
        new ApiResponse(200, null, "Document uploaded")
    );
});
export const uploadTempSelfie = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new ApiError(400, "No selfie uploaded");
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        throw new ApiError(400, "Session ID required");
    }

    // Only one selfie allowed
    const existingSelfie = await prisma.driver_Temp_Upload.findFirst({
        where: {
            Session_Id: sessionId,
            Is_Selfie: true
        }
    });

    if (existingSelfie) {
        throw new ApiError(409, "Selfie already uploaded");
    }

    await prisma.driver_Temp_Upload.create({
        data: {
            Session_Id: sessionId,
            Doc_Type: "selfie",
            Image_Path: req.file.path,
            Is_Selfie: true
        }
    });

    return res.json(
        new ApiResponse(200, null, "Selfie uploaded")
    );
});

export const finalizeCheckin = asyncHandler(async (req, res) => {

    const { sessionId, doNo, vehicleNo, driverName, mobile } = req.body;

    if (!sessionId || !doNo || !vehicleNo || !driverName || !mobile) {
        throw new ApiError(400, "Missing required fields");
    }

    const tempUploads = await prisma.driver_Temp_Upload.findMany({
        where: { Session_Id: sessionId }
    });

    if (tempUploads.length < 5) {
        throw new ApiError(400, "All documents and selfie required");
    }

    const requiredDocs = ["dl", "rc", "insurance", "fitness"];
    const uploadedTypes = tempUploads.map(d => d.Doc_Type);

    for (const doc of requiredDocs) {
        if (!uploadedTypes.includes(doc)) {
            throw new ApiError(400, `${doc} missing`);
        }
    }

    if (!uploadedTypes.includes("selfie")) {
        throw new ApiError(400, "Selfie missing");
    }

    // Prevent duplicate check-in
    const existing = await prisma.driver_Checkin.findFirst({
        where: {
            Do_No: doNo,
            Vehicle_No: vehicleNo,
            Status: "CheckedIn"
        }
    });

    if (existing) {
        throw new ApiError(409, "Driver already checked-in");
    }

    // Create DRIVER_CHECKIN
    const checkin = await prisma.driver_Checkin.create({
        data: {
            Do_No: doNo,
            Vehicle_No: vehicleNo,
            Driver_Name: driverName,
            Mobile: mobile,
            Status: "CheckedIn",
            Entry_Time: new Date()
        }
    });

    // Move documents
    for (const upload of tempUploads) {
        await prisma.driver_Documents.create({
            data: {
                Driver_Checkin_Id: checkin.Id,
                Doc_Type: upload.Doc_Type,
                Image_Path: upload.Image_Path,
                Verified: false
            }
        });
    }

    // Cleanup temp
    await prisma.driver_Temp_Upload.deleteMany({
        where: { Session_Id: sessionId }
    });

    return res.status(201).json(
        new ApiResponse(201, checkin, "Check-in successful")
    );
});