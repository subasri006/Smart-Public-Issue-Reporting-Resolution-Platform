const mongoose = require('mongoose');

const ComplaintSequenceSchema = new mongoose.Schema(
  {
    sequenceKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentValue: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ComplaintSequence = mongoose.model('ComplaintSequence', ComplaintSequenceSchema);

module.exports = ComplaintSequence;
