// models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'text', 'image'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    // For pdf and image, store URL/path; for text, store body.
    url: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
