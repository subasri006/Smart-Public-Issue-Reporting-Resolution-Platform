const mongoose = require('mongoose');

const ComplaintAttachmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      maxlength: 150,
    },
    fileOriginalName: {
      type: String,
      required: true,
      maxlength: 200,
    },
    fileType: {
      type: String,
      required: true,
      maxlength: 50,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
      maxlength: 300,
    },
    isResolutionEvidence: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

ComplaintAttachmentSchema.index({ complaint: 1, createdAt: 1 });

const ComplaintAttachment = mongoose.model('ComplaintAttachment', ComplaintAttachmentSchema);

module.exports = ComplaintAttachment;
