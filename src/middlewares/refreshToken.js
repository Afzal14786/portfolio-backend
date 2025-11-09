import { verifyToken, generateAccessToken } from "../utils/token.js";
import { adminModel } from "../models/admin/user.model.js";
import { publicModel } from "../models/publicUser/public.model.js";

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Authorization denied. No refresh token provided.",
      success: false,
    });
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    let user;
    
    // Determine which model to use based on userType in refresh token
    if (decoded.userType === 'admin') {
      user = await adminModel.findById(decoded.id);
    } else {
      user = await publicModel.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: "Authorization failed. User does not exist.", 
        success: false 
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
      userType: decoded.userType
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired refresh token.",
      success: false
    });
  }
}

export default refreshAccessToken;