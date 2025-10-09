import redis from "../../config/redisClient.js";
import { generateOtp } from "../../utils/opt.js";
import { sendEmail } from "../../emails/sendEmail.js";

const OTP_EXPIRY_SECONDS = 120; // 2 minutes

export const resendOtp = async (req, res) => {
    // 1. Get email from query parameters
    const email = req.query.email; // Extracted from /resend-otp?email=...

    if (!email) {
        // If email is missing, return a 400 error. The frontend will handle the toast/redirect.
        return res.status(400).json({
            message: "Email parameter is required for resend action.",
            success: false,
        });
    }

    const redisKey = `unverified:${email}`;

    try {
        // retrieve temporary data from Redis
        const storedUserDataJson = await redis.get(redisKey);
        
        if (!storedUserDataJson) {
            return res.status(404).json({
                message: "Verification session expired. Please register again.",
                success: false,
            });
        }

        const storedUserData = JSON.parse(storedUserDataJson);
        const newOtp = generateOtp();

        // update redis with the new OTP and reset the expiry time
        storedUserData.otp = newOtp; 
        await redis.set(redisKey, JSON.stringify(storedUserData), 'EX', OTP_EXPIRY_SECONDS);

        // send the new OTP email
        const subject = "New OTP Requested: Account Verification";
        const htmlBody = `Your new verification code is: <b>${newOtp}</b>. It expires in 2 minutes.`;
        
        const emailSent = await sendEmail({
            to: email,
            subject,
            html: htmlBody,
            text: `Your new OTP is ${newOtp}. It expires in 2 minute.`,
        });

        if (!emailSent) {
            // Return 503 if we couldn't send the email.
            return res.status(503).json({
                message: "Failed to send new OTP email. Check server email configuration.",
                success: false,
            });
        }
        
        // The frontend will reset the timer and show a success toast.
        return res.status(200).json({
            message: `New OTP has been sent to ${email}.`,
            success: true,
            data: {
                countdown: OTP_EXPIRY_SECONDS 
            }
        });

    } catch (err) {
        console.error("Resend OTP error:", err);
        return res.status(500).json({
            message: "An unexpected server error occurred during resend.",
            success: false,
        });
    }
};