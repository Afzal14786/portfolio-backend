import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model";

export const protect = async (req, res, next) => {
  let token;

  if ( req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
     try {
        token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decode.id).select("-password");
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
