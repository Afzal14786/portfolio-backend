import { adminModel } from "../../../models/admin/user.model.js";

export const getPublicProfile = async (req, res) => {
    try {
        const user = await adminModel.findOne({}).select("-password -otp -otpExpiry");

        if (!user) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(`Public Profile Fetch Error: ${error.message}`);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};