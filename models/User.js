const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'owner'], default: 'student' },
  otpHash: { type: String },
  otpExpires: { type: Number },
  otpAttempts: { type: Number, default: 0 },
  otpVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
