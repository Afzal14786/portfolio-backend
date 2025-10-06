import mongoose from 'mongoose';

/**
 * since we are not using redis, for secure logout we can use mongoDB
 */
const RevokedTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // Automatically delete the document after the max lifespan of your refresh token (e.g., 7 days)
  revokedAt: { 
    type: Date, 
    default: Date.now, 
    expires: '7d' 
  }, 
});

export const RevokedTokenModel = mongoose.model('RevokedToken', RevokedTokenSchema);