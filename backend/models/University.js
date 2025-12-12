const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, trim: true }, // e.g. JNTUH
    logoUrl: { type: String, trim: true }, // URL or /uploads/... path
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
