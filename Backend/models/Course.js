const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  subjects: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Course", courseSchema);
