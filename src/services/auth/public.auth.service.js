import { publicModel } from "../../models/publicUser/public.model.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import bcrypt from "bcryptjs";

export const validateRegistrationData = async (userData) => {
  const { name, user_name, email, password } = userData;

  // Check if user already exists
  const existingUser = await publicModel.findOne({ 
    $or: [{ email }, { user_name }] 
  });
  
  if (existingUser) {
    throw { code: 'USER_EXISTS', message: 'User already exists' };
  }

  // Hash password for temporary storage (will be used after verification)
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Return user data without creating in database
  return {
    name,
    user_name,
    email,
    password: hashedPassword,
    role: 'public'
  };
};

export const verifyAndCreatePublic = async (userData) => {
  // create user after successful OTP verification
  const newUser = await publicModel.create({
    name: userData.name,
    user_name: userData.user_name,
    email: userData.email,
    password: userData.password,  // already hashed the password
    isVerified: true,
    role: 'public'
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  return {
    user: newUser,
    accessToken,
    refreshToken
  };
};

export const publicLogin = async (email, password) => {
  // Find user in PUBLIC collection with password selected
  const user = await publicModel.findOne({ email }).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }
  
  // Check if account is locked
  if (user.isLocked()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    throw { 
      code: 'ACCOUNT_LOCKED', 
      message: `Account temporarily locked. Try again in ${remainingTime} minutes.` 
    };
  }
  
  // Check if account is active
  if (!user.isActive) {
    throw { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled' };
  }
  
  // Check if email is verified
  if (!user.isVerified) {
    throw { code: 'NOT_VERIFIED', message: 'Please verify your email before logging in' };
  }
  
  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    user.loginAttempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    
    await user.save();
    
    const remainingAttempts = 5 - user.loginAttempts;
    const message = remainingAttempts > 0 
      ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
      : 'Account locked due to too many failed attempts. Try again in 30 minutes.';
    
    throw { code: 'INVALID_CREDENTIALS', message };
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }
  
  return user;
};

export const getPublicUserByEmail = async (email) => {
  return await publicModel.findOne({ email });
};

export const updateLastActive = async (userId) => {
  return await publicModel.findByIdAndUpdate(
    userId,
    { 
      'engagement.lastActive': new Date() 
    },
    { new: true }
  );
};

export const incrementEngagementCount = async (userId, field) => {
  const updateField = `engagement.${field}`;
  return await publicModel.findByIdAndUpdate(
    userId,
    { 
      $inc: { [updateField]: 1 },
      'engagement.lastActive': new Date()
    },
    { new: true }
  );
};