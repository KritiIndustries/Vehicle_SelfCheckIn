import pool from "../db.js";

/**
 * Process incoming Aisensy WhatsApp webhook
 */
export const processAisensyWebhook = async (
    notification
) => {
    try {
        const topic = notification.topic;

        // Only process user messages
        if (
            topic !== "message.sender.user"
        ) {
            return;
        }

        const message =
            notification?.data?.message;

        if (!message) return;

        const phoneNumber =
            message.phone_number;

        const messageId = message.id;

        const messageType =
            message.message_type;
        // Correct Name Field
        const userName = message.userName || "";

        let imageUrl = "";

        // Extract image URL if message type is IMAGE
        // IMAGE MESSAGE
        if (messageType === "IMAGE") {
            imageUrl =
                message?.message_content?.url || "";
        }

        // For TEXT and BUTTON_REPLY
        // Store content inside image_url column
        else if (messageType === "TEXT") {

            imageUrl =
                (message?.message_content?.text || "")
                    .replace(/[^\x20-\x7E\u0900-\u097F]/g, "")
                    .trim();
        }

        else if (messageType === "BUTTON_REPLY") {

            imageUrl =
                message?.message_content?.title || "";
        }

        // Convert timestamp
        const whatsappDate =
            message.sent_at || Date.now();

        // Insert into database
        await saveMessageToDatabase({
            senderName:
                userName || message.userName || "",
            phoneNumber,
            messageId,
            imageUrl,
            messageType,
            campaignName:
                message?.campaign || "",
            createdAtWhatsapp: whatsappDate,
        });

        console.log(
            `Webhook processed for message ID: ${messageId}`
        );

    } catch (err) {
        console.error(
            "Webhook processing error:",
            err
        );
        throw err;
    }
};

/**
 * Save message to database with duplicate handling
 */
export const saveMessageToDatabase =
    async (messageData) => {
        try {
            const {
                senderName,
                phoneNumber,
                messageId,
                imageUrl,
                messageType,
                campaignName,
                createdAtWhatsapp,
            } = messageData;

            await pool.execute(
                `
                INSERT INTO coupon_uploads
                (
                    name,
                    phone_number,
                    message_id,
                    image_url,
                    message_type,
                    campaign_name,
                    created_at_whatsapp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
                [
                    senderName,
                    phoneNumber,
                    messageId,
                    imageUrl,
                    messageType,
                    campaignName,
                    createdAtWhatsapp,
                ]
            );

            console.log(
                "Message saved to database"
            );

        } catch (err) {
            // Handle duplicate entry
            if (
                err.code ===
                "ER_DUP_ENTRY"
            ) {
                console.log(
                    "Duplicate message ignored"
                );
                return;
            }

            throw err;
        }
    };

/**
 * Get all messages with pagination
 */
export const getAllMessagesService = async (
    page = 1,
    limit = 50
) => {
    try {
        const offset =
            (page - 1) * limit;

        const [rows] =
            await pool.execute(`
            SELECT * 
            FROM coupon_uploads
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `,
                [limit, offset]
            );

        const [countResult] =
            await pool.execute(`
            SELECT COUNT(*) as total 
            FROM coupon_uploads
        `);

        return {
            data: rows,
            total:
                countResult[0]
                    .total,
            page,
            limit,
        };

    } catch (err) {
        console.error(
            "Service error:",
            err
        );
        throw err;
    }
};

/**
 * Get messages filtered by campaign
 */
export const getMessagesByCampaign =
    async (campaignName) => {
        try {
            const [rows] =
                await pool.execute(
                    `
                SELECT * 
                FROM coupon_uploads
                WHERE campaign_name = ?
                ORDER BY id DESC
            `,
                    [campaignName]
                );

            return rows;

        } catch (err) {
            console.error(
                "Service error:",
                err
            );
            throw err;
        }
    };

/**
 * Get statistics
 */
export const getAisensyStatistics =
    async () => {
        try {
            const [stats] =
                await pool.execute(`
                SELECT 
                    COUNT(*) as total_messages,
                    COUNT(DISTINCT phone_number) as unique_numbers,
                    COUNT(DISTINCT campaign_name) as campaigns,
                    SUM(CASE WHEN message_type = 'IMAGE' THEN 1 ELSE 0 END) as image_count,
                    SUM(CASE WHEN message_type = 'TEXT' THEN 1 ELSE 0 END) as text_count
                FROM coupon_uploads
            `);

            return stats[0];

        } catch (err) {
            console.error(
                "Service error:",
                err
            );
            throw err;
        }
    };
