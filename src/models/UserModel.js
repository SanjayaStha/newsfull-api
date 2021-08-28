const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
      slugOn: {
        save: true,
        update: true,
        updateOne: true,
        updateMany: true,
        findOneAndUpdate: true,
      },
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      require: true,
      unique: true,
    },
    profile: String,
    signup_source: {
      type: String,
      enum: ["Facebook", "Google", "Email"],
      default: "Email",
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "User"],
      default: "User",
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    email_verification_token: String,
    phone_verification_token: String,
    social: {
      facebook: String,
      twitter: String,
      instagram: String,
      tiktok: String,
    },
    reset_password: {
      token: String,
      expire_at: {
        type: Date,
        default: null,
      },
    },
    address: {
      country: String,
      province: String,
      district: String,
      area: String,
      landmark: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
