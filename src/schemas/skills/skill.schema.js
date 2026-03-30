import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  title: String,
  icon: {
    type: String,
    default: "",
  },
  tags: [String]
});

export default skillSchema;