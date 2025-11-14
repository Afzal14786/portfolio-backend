import { verifyToken, generateAccessToken } from "../../utils/token.js";
import { adminModel } from "../../models/admin/user.model.js";
import { publicModel } from "../../models/publicUser/public.model.js";

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
        success: false,
      });
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    let user;
    if (decoded.userType === 'admin') {
      user = await adminModel.findById(decoded.id);
    } else {
      user = await publicModel.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: "User not found", 
        success: false 
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
      userType: decoded.userType
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired refresh token",
      success: false
    });
  }
};