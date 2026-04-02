import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import asyncHandler from "../utils/asyncHandler.js";

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});

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

export const deleteFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl) throw new Error("No file URL provided");

        // ✅ Matches your uploadToS3 URL format:
        // https://bucket.s3.region.amazonaws.com/documents/doNumber/file.jpg
        //                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^ this is the key
        const url = new URL(fileUrl);
        const key = decodeURIComponent(url.pathname.slice(1)); // remove leading "/"

        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME, // ✅ same env var as uploadToS3
            Key: key,
        });

        await s3.send(command); // ✅ same s3 client instance as uploadToS3

        console.log(`✅ Deleted from S3: ${key}`);
        return true;

    } catch (error) {
        console.error("❌ S3 delete failed:", error.message);
        return false; // non-fatal, don't crash the request
    }
};