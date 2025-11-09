import redis from "../config/redisClient.js";
import { generateOtp } from "../utils/opt.js";

// OTP Types and their configurations
export const OTP_TYPES = {
  REGISTRATION: 'registration',
  LOGIN: 'login', 
  PASSWORD_RESET: 'password_reset',
  PASSWORD_UPDATE: 'password_update',
  EMAIL_UPDATE: 'email_update',
  USERNAME_UPDATE: 'username_update',
};

// TTL configurations - FIXED
const getTTL = (type) => {
  const ttls = {
    [OTP_TYPES.REGISTRATION]: 10 * 60,   // 10 minutes
    [OTP_TYPES.LOGIN]: 2 * 60,           // 2 minutes
    [OTP_TYPES.PASSWORD_RESET]: 10 * 60, // 10 minutes
    [OTP_TYPES.PASSWORD_UPDATE]: 5 * 60, // 5 minutes
    [OTP_TYPES.EMAIL_UPDATE]: 5 * 60,    // 5 minutes
    [OTP_TYPES.USERNAME_UPDATE]: 5 * 60  // 5 minutes
  };
  return ttls[type] || 300; // Default 5 minutes
};

const generateRedisKey = (email, type) => {
  return `otp:${type}:${email}`;
};

export const generateOTP = async (email, type, metadata = {}) => {
  try {
    const otp = generateOtp();
    const redisKey = generateRedisKey(email, type);
    
    const otpData = {
      otp,
      email,
      type,
      timestamp: Date.now(),
      metadata: {
        name: metadata.name,
        user_name: metadata.user_name,
        email: metadata.email,
        password: metadata.password,
        userType: metadata.userType,
        attempts: 0
      }
    };
    
    const ttl = getTTL(type);
    const redisResult = await redis.setex(redisKey, ttl, JSON.stringify(otpData));
  
    
    return { 
      success: true,
      otp, 
      ttl,
      message: 'OTP generated successfully'
    };
  } catch (error) {
    console.error('OTP Generation Error:', error);
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Failed to generate OTP'
    };
  }
};

export const verifyOTP = async (email, otp, type) => {
  try {
    const redisKey = generateRedisKey(email, type);
    const storedData = await redis.get(redisKey);
    
    if (!storedData) {
      return { 
        success: false, 
        error: 'OTP_EXPIRED',
        message: 'OTP has expired or does not exist. Please request a new one.' 
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
    
    // Increment attempt counter
    otpData.metadata.attempts = (otpData.metadata.attempts || 0) + 1;
    
    // Check if too many attempts
    if (otpData.metadata.attempts >= 5) {
      await redis.del(redisKey);
      return { 
        success: false, 
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Too many failed attempts. OTP has been invalidated. Please request a new one.' 
      };
    }
    
    // Update attempts in Redis
    await redis.setex(redisKey, await redis.ttl(redisKey), JSON.stringify(otpData));
    
    if (otpData.otp !== otp) {
      return { 
        success: false, 
        error: 'INVALID_OTP',
        message: 'Invalid OTP. Please try again.',
        remainingAttempts: 5 - otpData.metadata.attempts
      };
    }
    
    // Clean up used OTP
    await redis.del(redisKey);
    
    return { 
      success: true, 
      message: 'OTP verified successfully',
      metadata: otpData.metadata 
    };
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return {
      success: false,
      error: 'VERIFICATION_FAILED', 
      message: 'Failed to verify OTP'
    };
  }
};

export const resendOTP = async (email, type, newMetadata = {}) => {
  try {
    const redisKey = generateRedisKey(email, type);
    
    // Check for existing OTP
    const existing = await redis.get(redisKey);
    
    if (existing) {
      const existingData = JSON.parse(existing);
      const timeSinceLast = Date.now() - existingData.timestamp;
      
      if (timeSinceLast < 20000) { 
        return { 
          success: false, 
          error: 'RESEND_COOLDOWN',
          message: 'Please wait 20 seconds before requesting a new OTP.',
          retryAfter: Math.ceil((20000 - timeSinceLast) / 1000)
        };
      }
      
      const mergedMetadata = {
        ...existingData.metadata,
        ...newMetadata,
        resendCount: (existingData.metadata.resendCount || 0) + 1,
        lastResend: Date.now()
      };
      
      // Delete existing OTP before generating new one
      await redis.del(redisKey);
      
      return await generateOTP(email, type, mergedMetadata);
    }
    
    // For registration, we should allow generating new OTP even if none exists
    if (type === OTP_TYPES.REGISTRATION) {
      console.log(`No existing OTP found for ${type}, generating new one for registration`);
      return await generateOTP(email, type, newMetadata);
    }
    
    // For other types, require existing OTP
    return { 
      success: false, 
      error: 'NO_OTP_FOUND',
      message: 'No OTP found to resend. Please request a new OTP first.'
    };
    
  } catch (error) {
    console.error('OTP Resend Error:', error);
    return {
      success: false,
      error: 'RESEND_FAILED',
      message: 'Failed to resend OTP'
    };
  }
};

export const getStoredOTPData = async (email, type) => {
  try {
    const redisKey = generateRedisKey(email, type);
    const storedData = await redis.get(redisKey);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Get OTP Data Error:', error);
    return null;
  }
};

export const invalidateOTP = async (email, type) => {
  try {
    const redisKey = generateRedisKey(email, type);
    await redis.del(redisKey);
    return { success: true, message: 'OTP invalidated successfully' };
  } catch (error) {
    console.error('Invalidate OTP Error:', error);
    return { success: false, error: 'INVALIDATION_FAILED' };
  }
};

export const checkOTPExists = async (email, type) => {
  try {
    const redisKey = generateRedisKey(email, type);
    const storedData = await redis.get(redisKey);
    return storedData !== null;
  } catch (error) {
    console.error('Check OTP Exists Error:', error);
    return false;
  }
};

export const getRemainingTTL = async (email, type) => {
  try {
    const redisKey = generateRedisKey(email, type);
    const ttl = await redis.ttl(redisKey);
    return ttl > 0 ? ttl : 0;
  } catch (error) {
    console.error('Get TTL Error:', error);
    return 0;
  }
};

export const cleanupExpiredOTPs = async () => {
  // Redis automatically expires keys, but this can be used for manual cleanup if needed
  return { success: true, message: 'Expired OTPs are automatically handled by Redis TTL' };
};