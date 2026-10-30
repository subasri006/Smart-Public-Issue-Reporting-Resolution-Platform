const mongoose = require('mongoose');

const ComplaintStatusHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      enum: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', null],
      default: null,
    },
    newStatus: {
      type: String,
      enum: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    comment: {
      type: String,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ComplaintStatusHistorySchema.index({ complaint: 1, createdAt: 1 });

const ComplaintStatusHistory = mongoose.model('ComplaintStatusHistory', ComplaintStatusHistorySchema);

module.exports = ComplaintStatusHistory;
