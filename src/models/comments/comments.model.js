import mongoose from "mongoose";
import commentSchema from "../../schemas/comment/comment.schema.js";

export const commentModel = new mongoose.model("Comment", commentSchema);