const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true },
    questionId: String,
    language: String,
    type: { type: String, default: "mcq" },
    title: { type: String, required: true },
    code: String,
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
