import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token;

  if ( req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
     try {
        token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decode.id).select("-password");
        if(!user) {
         return res.status(401).json({
            message: "Not Authorized, user no longer exists",
            message: false,
         });
        }
        req.user = user;
        next();
     } catch(err) {
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
