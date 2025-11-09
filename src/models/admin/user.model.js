import mongoose from "mongoose";
import { userSchema } from "../../schemas/admin/user.schema.js";

export const adminModel = new mongoose.model("Admin", userSchema);