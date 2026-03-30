import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  title: String,
  icon: String,
  tags: [String]
});

export default skillSchema;