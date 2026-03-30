import mongoose from "mongoose";
import skillSchema from "../../schemas/skills/skill.schema.js";

export const skillModel = new mongoose.model("Skill", skillSchema);