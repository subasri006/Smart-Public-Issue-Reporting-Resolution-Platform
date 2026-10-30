const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password in normal queries
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    role: {
      type: String,
      enum: ['ROLE_CITIZEN', 'ROLE_STAFF', 'ROLE_ADMIN'],
      default: 'ROLE_CITIZEN',
      required: true,
      index: true,
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
        delete ret.password;
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

// Helpful instance method to check active status
UserSchema.methods.isActive = function () {
  return this.active === true;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
