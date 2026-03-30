import mongoose from "mongoose";
const journeySchema = new mongoose.Schema({
  year: String,
  title: String,
  description: String
});

export default journeySchema;