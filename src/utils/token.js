import jwt from "jsonwebtoken";
import {adminModel} from "../models/admin/user.model.js";
import {publicModel} from "../models/publicUser/public.model.js";

// Helper function to get correct model
export const getUserModel = (userType) => {
  switch (userType) {
    case 'admin':
      return adminModel;
    case 'public':
      return publicModel;
    default:
      return publicModel;
  }
};

// Updated token generation with userType
export const generateAccessToken = (user) => {
  const userType = user.role === 'Admin' ? 'admin' : 'public';
  
  return jwt.sign(
    { 
      id: user._id, 
      userType: userType
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (user) => {
  const userType = user.role === 'Admin' ? 'admin' : 'public';
  
  return jwt.sign(
    { 
      id: user._id, 
      userType: userType
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};