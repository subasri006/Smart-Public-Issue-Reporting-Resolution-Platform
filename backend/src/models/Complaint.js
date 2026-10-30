const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintCategory',
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'],
      default: 'SUBMITTED',
      required: true,
      index: true,
    },
    priorityScore: {
      type: Number,
      default: 0.0,
      index: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Indexes
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ citizen: 1, createdAt: -1 });
ComplaintSchema.index({ assignedStaff: 1, createdAt: -1 });
ComplaintSchema.index({ location: '2dsphere' }, { sparse: true });

// Pre-save hook to populate GeoJSON coordinates if latitude & longitude are provided
ComplaintSchema.pre('save', function (next) {
  if (this.latitude !== null && this.longitude !== null &&
      this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  } else {
    this.location = undefined;
  }
  next();
});

const Complaint = mongoose.model('Complaint', ComplaintSchema);

module.exports = Complaint;
