import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  courseName: String,
  instituteName: String,
  teacherName: String,
  teacherImage: String,
  skills: [String],
  certificateImage: String
});

export default certificateSchema