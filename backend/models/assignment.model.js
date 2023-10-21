const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
