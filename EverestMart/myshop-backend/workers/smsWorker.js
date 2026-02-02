/**
 * SMS Queue Worker
 * Processes SMS jobs from the queue
 */

const { smsQueue } = require('../config/queue');
const axios = require('axios');

// SMS service configuration (using MSG91 or Twilio)
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'EVRMART';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'msg91'; // 'msg91' or 'twilio'

/**
 * Send SMS via MSG91
 */
async function sendSMS_MSG91(phone, message) {
    const url = 'https://api.msg91.com/api/v5/flow/';

    try {
        const response = await axios.post(url, {
            sender: SMS_SENDER_ID,
            route: '4',
            country: '91',
            sms: [{
                message: message,
                to: [phone]
            }]
        }, {
            headers: {
                'authkey': SMS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('MSG91 SMS error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Send SMS via Twilio
 */
async function sendSMS_Twilio(phone, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const client = require('twilio')(accountSid, authToken);

    try {
        const result = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: `+91${phone}`
        });

        return result;
    } catch (error) {
        console.error('Twilio SMS error:', error.message);
        throw error;
    }
}

/**
 * Send SMS based on provider
 */
async function sendSMS(phone, message) {
    if (!SMS_API_KEY) {
        console.warn('⚠️ SMS API key not configured, skipping SMS');
        return { skipped: true };
    }

    if (SMS_PROVIDER === 'twilio') {
        return await sendSMS_Twilio(phone, message);
    } else {
        return await sendSMS_MSG91(phone, message);
    }
}

// Process SMS jobs
smsQueue.process(async (job) => {
    const { type, data } = job.data;

    console.log(`📱 Processing SMS job: ${type}`);

    try {
        let message = '';

        switch (type) {
            case 'otp':
                message = `Your EverestMart OTP is ${data.otp}. Valid for 10 minutes. Do not share with anyone.`;
                break;

            case 'order-placed':
                message = `Order #${data.orderId} placed successfully! Track at: ${data.trackingUrl}`;
                break;

            case 'order-shipped':
                message = `Your order #${data.orderId} is out for delivery! Expected by ${data.estimatedTime}`;
                break;

            case 'order-delivered':
                message = `Order #${data.orderId} delivered successfully. Thank you for shopping with EverestMart!`;
                break;

            case 'low-balance':
                message = `Low wallet balance alert! Current balance: ₹${data.balance}. Recharge now.`;
                break;

            default:
                message = data.message || 'Update from EverestMart';
        }

        await sendSMS(data.phone, message);

        return { success: true, type };
    } catch (error) {
        console.error(`SMS job failed:`, error);
        throw error;
    }
});

console.log('📱 SMS worker started');

module.exports = smsQueue;
