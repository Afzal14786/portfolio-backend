import mongoose from "mongoose";
import likeSchema from "../../schemas/likes/likes.schema.js";

export const likesModel = new mongoose.model("Like", likeSchema);