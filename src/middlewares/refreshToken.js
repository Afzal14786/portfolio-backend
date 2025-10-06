import { verifyToken, generateAccessToken } from "../utils/token.js";
import { userModel } from "../../models/user.model.js";

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Authorization denied. No refresh token provided.",
            success: false,
        });
    }

    try {
        const decode = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await userModel.findById(decode.id);
        
        if (!user) {
             return res.status(401).json({ message: "Authorization failed. User does not exist.", success: false });
        }

        const newAccessToken = generateAccessToken(user);

        res.json ({
            accessToken: newAccessToken
        });
    } catch(err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token.",
            success: false
        });
    }
}

export default refreshAccessToken;