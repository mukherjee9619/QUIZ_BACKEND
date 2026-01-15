const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  q: { type: String, required: true },
  options: { type: [String], required: true },
  answerIndex: { type: Number, required: true }, // index of correct option
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
