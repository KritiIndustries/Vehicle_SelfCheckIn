import {
    TextractClient, DetectDocumentTextCommand, StartDocumentTextDetectionCommand,
    GetDocumentTextDetectionCommand
} from "@aws-sdk/client-textract";
const textractClient = new TextractClient({
    // Textract must run in the same region as the bucket
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.OCR_ACCESS_KEY,
        secretAccessKey: process.env.OCR_SECRET_KEY
    }
});

export const extractTextFromS3 = async (s3Key) => {
    const command = new DetectDocumentTextCommand({
        Document: {
            S3Object: {
                Bucket: process.env.S3_BUCKET_NAME,
                Name: s3Key
            }
        }
    });

    const response = await textractClient.send(command);

    const lines = response.Blocks
        ?.filter((block) => block.BlockType === "LINE")
        .map((block) => block.Text);

    return lines || [];
};

// Convenience helper when you only have a public S3 URL
export const extractTextFromS3Url = async (url) => {
    if (!url) return [];

    // Example: https://bucket.s3.region.amazonaws.com/documents/...
    const parsed = new URL(url);
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));

    return extractTextFromS3(key);
};




export const extractTextFromPdf = async (s3Url) => {

    const bucket = process.env.S3_BUCKET_NAME;
    const key = s3Url.split(".amazonaws.com/")[1];

    const startCommand = new StartDocumentTextDetectionCommand({
        DocumentLocation: {
            S3Object: {
                Bucket: bucket,
                Name: key
            }
        }
    });

    const startResponse = await textractClient.send(startCommand);

    const jobId = startResponse.JobId;

    let finished = false;
    let lines = [];

    while (!finished) {

        await new Promise(r => setTimeout(r, 2000));

        const result = await textractClient.send(
            new GetDocumentTextDetectionCommand({
                JobId: jobId
            })
        );

        if (result.JobStatus === "SUCCEEDED") {

            result.Blocks.forEach(b => {
                if (b.BlockType === "LINE") {
                    lines.push(b.Text);
                }
            });

            finished = true;
        }
    }

    return lines;
};