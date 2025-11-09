import mongoose from "mongoose";
import {blogSchema} from "../../schemas/blog/blog.schema.js";

export const blogModel = new mongoose.model("Blogs", blogSchema);