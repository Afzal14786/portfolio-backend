import redis from "../config/redisClient.js";
import { generateOtp } from "../utils/opt.js";

// OTP Types and their configurations
export const OTP_TYPES = {
  REGISTRATION: 'registration',
  LOGIN: 'login', 
  PASSWORD_RESET: 'password_reset',
  PASSWORD_UPDATE: 'password_update',
  EMAIL_UPDATE: 'email_update'
};

// TTL configurations
const getTTL = (type) => {
  const ttls = {
    [OTP_TYPES.REGISTRATION]: 10 * 60,    // 10 minutes
    [OTP_TYPES.LOGIN]: 5 * 60,           // 5 minutes
    [OTP_TYPES.PASSWORD_RESET]: 10 * 60, // 10 minutes
    [OTP_TYPES.PASSWORD_UPDATE]: 5 * 60, // 5 minutes
    [OTP_TYPES.EMAIL_UPDATE]: 10 * 60    // 10 minutes
  };
  return ttls[type] || 300; // Default 5 minutes
};

const generateRedisKey = (email, type) => {
  return `otp:${type}:${email}`;
};

export const generateOTP = async (email, type, metadata = {}) => {
  const otp = generateOtp();
  const redisKey = generateRedisKey(email, type);
  
  const otpData = {
    otp,
    email,
    type,
    timestamp: Date.now(),
    metadata
  };
  
  const ttl = getTTL(type);
  await redis.setex(redisKey, ttl, JSON.stringify(otpData));
  
  return { otp, ttl };
};

export const verifyOTP = async (email, otp, type) => {
  const redisKey = generateRedisKey(email, type);
  const storedData = await redis.get(redisKey);
  
  if (!storedData) {
    return { 
      success: false, 
      error: 'OTP_EXPIRED',
      message: 'OTP has expired. Please request a new one.' 
    };
  }
  
  const otpData = JSON.parse(storedData);
  
  if (otpData.type !== type) {
    return { 
      success: false, 
      error: 'INVALID_CONTEXT',
      message: 'Invalid OTP context.' 
    };
  }
  
  if (otpData.otp !== otp) {
    // Optional: Implement OTP attempt counter here
    return { 
      success: false, 
      error: 'INVALID_OTP',
      message: 'Invalid OTP. Please try again.' 
    };
  }
  
  // Clean up used OTP
  await redis.del(redisKey);
  
  return { 
    success: true, 
    message: 'OTP verified successfully',
    metadata: otpData.metadata 
  };
};

export const resendOTP = async (email, type, newMetadata = {}) => {
  const redisKey = generateRedisKey(email, type);
  
  // Check for recent OTP and implement cooldown
  const existing = await redis.get(redisKey);
  if (existing) {
    const existingData = JSON.parse(existing);
    const timeSinceLast = Date.now() - existingData.timestamp;
    
    if (timeSinceLast < 30000) { // 30 seconds cooldown
      return { 
        success: false, 
        error: 'RESEND_COOLDOWN',
        message: 'Please wait 30 seconds before requesting a new OTP.',
        retryAfter: Math.ceil((30000 - timeSinceLast) / 1000)
      };
    }
    
    // Delete existing OTP before generating new one
    await redis.del(redisKey);
  }
  
  return await generateOTP(email, type, newMetadata);
};

export const getStoredOTPData = async (email, type) => {
  const redisKey = generateRedisKey(email, type);
  const storedData = await redis.get(redisKey);
  return storedData ? JSON.parse(storedData) : null;
};

export const invalidateOTP = async (email, type) => {
  const redisKey = generateRedisKey(email, type);
  await redis.del(redisKey);
  return { success: true, message: 'OTP invalidated successfully' };
};

export const checkOTPExists = async (email, type) => {
  const redisKey = generateRedisKey(email, type);
  const storedData = await redis.get(redisKey);
  return storedData !== null;
};

export const getRemainingTTL = async (email, type) => {
  const redisKey = generateRedisKey(email, type);
  const ttl = await redis.ttl(redisKey);
  return ttl > 0 ? ttl : 0;
};

export const cleanupExpiredOTPs = async () => {
  // Redis automatically expires keys, but this can be used for manual cleanup if needed
  // Note: For large-scale cleanup, use Redis SCAN command
  return { success: true, message: 'Expired OTPs are automatically handled by Redis TTL' };
};