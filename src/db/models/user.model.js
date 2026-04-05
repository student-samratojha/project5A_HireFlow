const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "interviewer", "candidate"],
      default: "candidate",
    },

    profileImage: {
      type: String,
      default: "/images/default.png",
    },

    department: {
      type: String,
    },

    skills: [
      {
        type: String,
      },
    ],

    address: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);