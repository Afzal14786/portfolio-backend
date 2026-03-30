import mongoose from "mongoose";
import journeySchema from "../../schemas/journey/journey.schema.js";

export const journeyModel = new mongoose.model("Journey", journeySchema);