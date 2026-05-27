import crypto from "crypto";
import XLSX from "xlsx";
import pool from "../db.js";
import {
    processAisensyWebhook,
} from "../services/aisensy.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * Handle Aisensy WhatsApp webhook
 * POST /webhook/aisensy
 */
export const handleAisensyWebhook = asyncHandler(
    async (req, res) => {
        try {
            const signature =
                req.headers["x-aisensy-signature"];

            // Verify signature
            // const isValid =
            //     verifyAisensySignature(
            //         req.rawBody,
            //         signature
            //     );

            // if (!isValid) {
            //     return res.status(401).json(
            //         new ApiError(
            //             401,
            //             "Invalid Signature"
            //         )
            //     );
            // }

            const notification = req.body;

            // Respond immediately
            res.status(200).json(
                new ApiResponse(
                    200,
                    null,
                    "Webhook received"
                )
            );

            // Process webhook asynchronously
            processAisensyWebhook(notification);

        } catch (err) {
            console.error(
                "Webhook Error:",
                err
            );
            res.status(500).json(
                new ApiError(
                    500,
                    "Webhook processing failed"
                )
            );
        }
    }
);

/**
 * Export WhatsApp data to Excel
 * GET /export/excel
 */
export const exportToExcel = asyncHandler(
    async (req, res) => {
        try {
            const [rows] =
                await pool.execute(`
                SELECT * 
                FROM coupon_uploads
                ORDER BY id DESC
            `);

            const excelData = rows.map(
                (item) => ({
                    Name: item.name,
                    Number: item.phone_number,
                    Image: item.image_url,
                    Type: item.message_type,
                    Campaign:
                        item.campaign_name,
                    Date: new Date(
                        Number(
                            item.created_at_whatsapp
                        )
                    ).toLocaleDateString(),
                    Time: new Date(
                        Number(
                            item.created_at_whatsapp
                        )
                    ).toLocaleTimeString(),
                })
            );

            const worksheet =
                XLSX.utils.json_to_sheet(
                    excelData
                );

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Coupons"
            );

            const buffer = XLSX.write(
                workbook,
                {
                    type: "buffer",
                    bookType: "xlsx",
                }
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=coupons.xlsx"
            );

            res.type(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.send(buffer);

        } catch (err) {
            console.error(
                "Export Error:",
                err
            );
            res.status(500).json(
                new ApiError(
                    500,
                    "Excel export failed"
                )
            );
        }
    }
);

/**
 * Get all WhatsApp messages from database
 * GET /aisensy/messages
 */
export const getAllMessages =
    asyncHandler(async (req, res) => {
        try {
            const [rows] =
                await pool.execute(`
                SELECT * 
                FROM coupon_uploads
                ORDER BY id DESC
            `);

            res.status(200).json(
                new ApiResponse(
                    200,
                    rows,
                    "Messages retrieved"
                )
            );

        } catch (err) {
            console.error(
                "Fetch Error:",
                err
            );
            res.status(500).json(
                new ApiError(
                    500,
                    "Failed to fetch messages"
                )
            );
        }
    });

/**
 * Get messages by phone number
 * GET /aisensy/messages/:phoneNumber
 */
export const getMessagesByPhone =
    asyncHandler(async (req, res) => {
        try {
            const { phoneNumber } = req.params;

            if (!phoneNumber) {
                return res.status(400).json(
                    new ApiError(
                        400,
                        "Phone number required"
                    )
                );
            }

            const [rows] =
                await pool.execute(
                    `
                SELECT * 
                FROM coupon_uploads
                WHERE phone_number = ?
                ORDER BY id DESC
            `,
                    [phoneNumber]
                );

            res.status(200).json(
                new ApiResponse(
                    200,
                    rows,
                    "Messages retrieved"
                )
            );

        } catch (err) {
            console.error(
                "Fetch Error:",
                err
            );
            res.status(500).json(
                new ApiError(
                    500,
                    "Failed to fetch messages"
                )
            );
        }
    });

/**
 * Verify Aisensy webhook signature
 */
const verifyAisensySignature = (
    rawBody,
    receivedSignature
) => {
    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.WEBHOOK_SECRET || "default_secret"
        )
        .update(rawBody)
        .digest("hex");

    return (
        generatedSignature ===
        receivedSignature
    );
};
