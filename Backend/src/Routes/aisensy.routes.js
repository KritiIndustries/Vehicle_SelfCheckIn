import { Router } from "express";
import {
    handleAisensyWebhook,
    exportToExcel,
    getAllMessages,
    getMessagesByPhone,
} from "../Controllers/aisensy.controller.js";
import bodyParser from "body-parser";

const router = Router();

/**
 * IMPORTANT: RAW BODY REQUIRED FOR WEBHOOK SIGNATURE VERIFICATION
 * This middleware must be applied before the webhook endpoint
 */
const webhookBodyParser = bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    },
});

/**
 * Aisensy WhatsApp Webhook
 * POST /webhook/aisensy
 * Receives messages from Aisensy WhatsApp integration
 */
router.post(
    "/webhook",
    webhookBodyParser,
    handleAisensyWebhook
);

/**
 * Export messages to Excel
 * GET /aisensy/export/excel
 */
router.get("/export/excel", exportToExcel);

/**
 * Get all messages
 * GET /aisensy/messages
 */
router.get("/messages", getAllMessages);

/**
 * Get messages by phone number
 * GET /aisensy/messages/:phoneNumber
 */
router.get(
    "/messages/:phoneNumber",
    getMessagesByPhone
);

export default router;
