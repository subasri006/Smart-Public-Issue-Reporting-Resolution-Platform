const mongoose = require('mongoose');

const ComplaintCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
      default: '',
    },
    weight: {
      type: Number,
      required: true,
      default: 15,
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'HelpCircle',
    },
    active: {
      type: Boolean,
      default: true,
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

const ComplaintCategory = mongoose.model('ComplaintCategory', ComplaintCategorySchema);

module.exports = ComplaintCategory;
