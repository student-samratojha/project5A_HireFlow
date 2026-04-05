const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    position: String,
    experience: Number,
    interviewDate: Date,

    status: {
      type: String,
      enum: ["Pending", "Selected", "Rejected"],
      default: "Pending",
    },

    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Candidate", candidateSchema);
