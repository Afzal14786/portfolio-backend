import mongoose from "mongoose";
import { userSchema } from "../schemas/user.schema.js";

export const userModel = new mongoose.model("User", userSchema);