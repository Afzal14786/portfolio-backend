import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['inprocess', 'complete'], default: 'inprocess' },
  techStack: [String],
  demoLink: String,
  githubLink: String,
  imageUrl: {
    type: String,
    default: "",
  },
  createdAt: Date
});

export default projectSchema;