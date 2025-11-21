import mongoose from "mongoose";
import shareSchema from "../../schemas/share/share.schema.js";

export const shareModel = new mongoose.model("Share", shareSchema);