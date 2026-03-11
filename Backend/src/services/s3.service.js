import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import asyncHandler from "../utils/asyncHandler.js";

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});

// export const uploadToS3 = async (file) => {

//     console.log("UploadTOS3 Function", file);

//     const fileKey = `documents/${uuid()}-${file.originalname}`;

//     console.log("File Key", fileKey);

//     const command = new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: fileKey,
//         Body: file.buffer,
//         ContentType: file.mimetype
//     });

//     await s3.send(command);

//     return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
// };

export const uploadToS3 = async (file, doNumber, type) => {

    const extension = file.originalname.split(".").pop();

    const fileName = `${doNumber}_${type.toUpperCase()}.${extension}`;

    const fileKey = `documents/${doNumber}/${fileName}`;

    console.log("Uploading to S3:", fileKey);

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
};

export const getS3Image = asyncHandler(async (req, res) => {

    const { folder, subfolder, filename } = req.params;

    const key = `${folder}/${subfolder}/${filename}`;

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    });

    const response = await s3.send(command);

    res.setHeader("Content-Type", response.ContentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    response.Body.pipe(res);

});