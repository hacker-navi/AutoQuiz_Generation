const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. Unit 1: Introduction
    order: { type: Number, default: 1 }, // 1..5
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Unit', unitSchema);
