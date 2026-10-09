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
export const exportToExcelWithoutDateFilter = asyncHandler(
    async (req, res) => {
        try {
            const [rows] =
                await pool.execute(`
                SELECT * 
                FROM coupon_uploads
                ORDER BY id DESC
            `);

            // const excelData = rows.map(
            //     (item) => ({
            //         Name: item.name,
            //         Number: item.phone_number,
            //         Image: item.image_url,
            //         Type: item.message_type,
            //         Campaign:
            //             item.campaign_name,
            //         Date: new Date(
            //             Number(
            //                 item.created_at_whatsapp
            //             )
            //         ).toLocaleDateString(),
            //         Time: new Date(
            //             Number(
            //                 item.created_at_whatsapp
            //             )
            //         ).toLocaleTimeString(),
            //     })
            // );

            const excelData = rows.map((item) => {
                const date = new Date(
                    Number(item.created_at_whatsapp)
                );

                return {
                    Name: item.name,
                    Number: item.phone_number,
                    Image: item.image_url,
                    Type: item.message_type,
                    Campaign: item.campaign_name,

                    Date: date.toLocaleDateString(
                        "en-GB",
                        {
                            timeZone: "Asia/Kolkata",
                        }
                    ), // DD/MM/YYYY

                    Time: date.toLocaleTimeString(
                        "en-IN",
                        {
                            timeZone: "Asia/Kolkata",
                            hour12: false,
                        }
                    ), // HH:mm:ss
                };
            });

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


export const exportToExcel = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate required parameters
        if (!startDate || !endDate) {
            return res.status(400).send(`
                <h2>Coupon Excel Export</h2>
                <p>Please provide both start date and end date.</p>
                <form method="GET" action="/api/aisensy/export/excel">
                    <label>Start Date:</label>
                    <input type="date" name="startDate" required
                        value="${startDate || ""}" />
                    <br/><br/>

                    <label>End Date:</label>
                    <input type="date" name="endDate" required
                        value="${endDate || ""}" />
                    <br/><br/>

                    <button type="submit">Download Excel</button>
                </form>
            `);
        }

        // Validate YYYY-MM-DD and reject invalid calendar dates
        const isValidDate = (value) => {
            if (
                typeof value !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value)
            ) {
                return false;
            }

            const date = new Date(`${value}T00:00:00.000Z`);

            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        };

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).send(
                "Invalid date. Use YYYY-MM-DD format."
            );
        }

        if (startDate > endDate) {
            return res.status(400).send(
                "Start date cannot be later than end date."
            );
        }

        // Convert IST calendar dates into epoch milliseconds.
        // Start: inclusive at 00:00:00 IST.
        // End: exclusive at 00:00:00 IST on the following day.
        const startTimestamp = new Date(
            `${startDate}T00:00:00+05:30`
        ).getTime();

        const endTimestampExclusive =
            new Date(`${endDate}T00:00:00+05:30`).getTime()
            + 24 * 60 * 60 * 1000;

        // Parameterized query: safely filter by date range
        const [rows] = await pool.execute(
            `
                SELECT *
                FROM coupon_uploads
                WHERE created_at_whatsapp >= ?
                  AND created_at_whatsapp < ?
                ORDER BY id DESC
            `,
            [startTimestamp, endTimestampExclusive]
        );

        const excelData = rows.map((item) => {
            const date = new Date(
                Number(item.created_at_whatsapp)
            );

            return {
                Name: item.name,
                Number: item.phone_number,
                Image: item.image_url,
                Type: item.message_type,
                Campaign: item.campaign_name,

                Date: date.toLocaleDateString("en-GB", {
                    timeZone: "Asia/Kolkata",
                }),

                Time: date.toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour12: false,
                }),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Coupons"
        );

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        const filename = `coupons_${startDate}_to_${endDate}.xlsx`;

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.type(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);

    } catch (err) {
        console.error("Export Error:", err);

        return res.status(500).json(
            new ApiError(500, "Excel export failed")
        );
    }
});


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
