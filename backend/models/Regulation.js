const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. R22
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Regulation', regulationSchema);
