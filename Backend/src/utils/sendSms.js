import axios from "axios";

export const sendSMS = async ({ mobile, message, OTPTemplate, clientSmsId }) => {
    try {
        const payload = {
            listsms: [
                {
                    sms: message,
                    mobiles: mobile, // +91XXXXXXXXXX
                    senderid: process.env.SENDER_ID,
                    clientsmsid: clientSmsId || Date.now().toString(),
                    accountusagetypeid: process.env.ACCOUNT_USAGE_TYPE, // 6 for OTP
                    entityid: process.env.ENTITY_ID,
                    tempid: OTPTemplate
                }
            ],
            password: process.env.SMS_API_KEY,
            user: process.env.USER_ID
        };

        const response = await axios.post(
            "http://sms.bulkssms.com/REST/sendsms/",
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("SMS Sending Failed:", error.response?.data || error.message);
        throw new Error("SMS sending failed");
    }
};