import mongoose from "mongoose";
import projectSchema from "../../schemas/project/project.schema.js";

export const projectModel = new mongoose.model("Project", projectSchema);