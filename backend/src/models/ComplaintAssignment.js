const mongoose = require('mongoose');

const ComplaintAssignmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'assignedAt', updatedAt: false },
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

ComplaintAssignmentSchema.index({ complaint: 1, assignedAt: -1 });

const ComplaintAssignment = mongoose.model('ComplaintAssignment', ComplaintAssignmentSchema);

module.exports = ComplaintAssignment;
