import jwt from "jsonwebtoken";
import { adminModel } from "../models/admin/user.model.js";
import { publicModel } from "../models/publicUser/public.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      
      // Determine which model to use based on userType in token
      if (decoded.userType === 'admin') {
        user = await adminModel.findById(decoded.id).select("-password");
      } else {
        user = await publicModel.findById(decoded.id).select("-password");
      }
      
      if (!user) {
        return res.status(401).json({
          message: "Not Authorized, user no longer exists",
          success: false,
        });
      }
      
      // Add user type to req.user for easy access in controllers
      req.user = {
        ...user.toObject(),
        userType: decoded.userType
      };
      
      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({
        message: "Not Authorized, token failed",
        success: false,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
      success: false
    });
  }
};

// Add role-specific middlewares
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
      success: false
    });
  }
};

export const requirePublicUser = (req, res, next) => {
  if (req.user && req.user.userType === 'public') {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Public user access required.",
      success: false
    });
  }
};