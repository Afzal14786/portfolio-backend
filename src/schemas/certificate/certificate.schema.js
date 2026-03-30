import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  courseName: String,
  instituteName: String,
  teacherName: String,
  teacherImage: {
    type: String,
    default: "",
  },
  skills: [String],
  certificateImage: {
    type: String,
    default: ""
  }
});

export default certificateSchema