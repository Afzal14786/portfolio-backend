import mongoose from "mongoose";
import { userSchema } from "../schemas/user.schema";

export const userModel = new mongoose.model("User", userSchema);