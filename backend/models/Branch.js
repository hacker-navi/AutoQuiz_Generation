const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. CSE
    code: { type: String, trim: true }, // optional
    regulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Regulation',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
