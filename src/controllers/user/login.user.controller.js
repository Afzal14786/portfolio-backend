import { userModel } from "../../models/user.model.js";
import { RevokedTokenModel } from "../../schemas/user/RevokeTokenSchema.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields required",
      success: false,
    });
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      message: "User not found, kindly create an account",
      success: false,
    });
  }

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    return res.status(400).json({
      message: "Incorrect Password",
      success: false,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.status(200).json({
    message: "Logged In Successfully",
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    },
  });
};

// let's logout the user

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      await RevokedTokenModel.create({ token: refreshToken });
    } catch (err) {
      console.error(`Error blacklisting the token : ${err.message}`);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res.status(200).json({
    message:
      "Logged Out Successfully. Refresh Token revoked and cookie cleared.",
    success: true,
  });
};
