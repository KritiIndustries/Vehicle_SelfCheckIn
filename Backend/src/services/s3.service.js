import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

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