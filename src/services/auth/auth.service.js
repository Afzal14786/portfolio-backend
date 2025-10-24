import {userModel} from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js"; // Fixed import path

export const registerUser = async (userData) => {
  const { name, user_name, email, password } = userData;
  
  // Check if user already exists
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw { code: 'USER_EXISTS', message: 'User already exists' };
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);
  
  return {
    name,
    user_name,
    email,
    password: hashPassword
  };
};

export const verifyAndCreateUser = async (userData) => {
  const newUser = await userModel.create({
    name: userData.name,
    user_name: userData.user_name,
    email: userData.email,
    password: userData.password,
    isVerified: true,
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  return {
    user: newUser,
    accessToken,
    refreshToken
  };
};

export const loginUser = async (email, password) => {
  const user = await userModel.findOne({ email }).select("+password");
  
  if (!user) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  if (!user.isVerified) {
    throw { code: 'NOT_VERIFIED', message: 'Please verify your email before logging in' };
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }

  return user;
};

export const getUserByEmail = async (email) => {
  return await userModel.findOne({ email });
};