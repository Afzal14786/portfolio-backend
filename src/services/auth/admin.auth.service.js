import {adminModel} from "../../models/admin/user.model.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";

export const validateAdminRegistration = async (userData) => {
  const { name, user_name, email, password } = userData;
  
  const existingAdmin = await adminModel.findOne({ 
    $or: [{ email }, { user_name }]
  });
  
  if (existingAdmin) {
    throw { code: 'USER_EXISTS', message: 'Admin user already exists' };
  }

  if (password.length < 8) {
    throw { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long' };
  }

  const hashPassword = await bcrypt.hash(password, 12);
  
  return {
    name,
    user_name,
    email,
    password: hashPassword
  };
};

export const verifyAndCreateAdmin = async (userData) => {
  try {
    const newUser = await adminModel.create({
      name: userData.name,
      user_name: userData.user_name,
      email: userData.email,
      password: userData.password,
      role: 'Admin',
      isVerified: true,
      isActive: true,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return {
      user: newUser,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Error in verifyAndCreateAdmin:', error);
    throw error;
  }
};

export const adminLogin = async (email, password) => {
  // select security fields
  const user = await adminModel.findOne({ email })
    .select("+password +loginAttempts +lockUntil");
  
  if (!user) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid admin credentials' };
  }

  // account lock check
  if (user.isLocked()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    throw { 
      code: 'ACCOUNT_LOCKED', 
      message: `Admin account locked. Try again in ${remainingTime} minutes.` 
    };
  }

  // account active check
  if (!user.isActive) {
    throw { code: 'ACCOUNT_DISABLED', message: 'Admin account has been disabled' };
  }

  if (!user.isVerified) {
    throw { code: 'NOT_VERIFIED', message: 'Please verify your email before logging in' };
  }

  const matchPassword = await user.comparePassword(password);
  
  if (!matchPassword) {
    // increment failed attempts
    await user.incrementLoginAttempts();
    
    const remainingAttempts = 3 - user.loginAttempts;
    const message = remainingAttempts > 0 
      ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
      : `Admin account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`;
    
    throw { code: 'INVALID_CREDENTIALS', message };
  }

  // reset attempts on successful login and update last login
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save();

  return user;
};

export const getAdminByEmail = async (email) => {
  return await adminModel.findOne({ email });
};

// update last activity
export const updateAdminLastActivity = async (adminId) => {
  return await adminModel.findByIdAndUpdate(
    adminId,
    { lastLogin: new Date() },
    { new: true }
  );
};