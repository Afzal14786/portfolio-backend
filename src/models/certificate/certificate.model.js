import mongoose from "mongoose"
import certificateSchema from "../../schemas/certificate/certificate.schema.js"

export const certificateModel = new mongoose.model("Certificate", certificateSchema);