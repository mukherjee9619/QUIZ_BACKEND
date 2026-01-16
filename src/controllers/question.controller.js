const Question = require("../models/Question");
const Subject = require("../models/Subject");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");
const dbConnect = require("../config/db");

/* ================= ADD QUESTION ================= */
exports.addQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    const data = req.body;

    if (!data.subjectId || !data.title) {
      return res.status(400).json({ message: "Subject and title required" });
    }

    if (!Array.isArray(data.options) || data.options.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 options required" });
    }

    const question = await Question.create({
      subjectId: data.subjectId,
      questionId: data.questionId || null,
      language: data.language || null,
      type: data.type || "mcq",
      title: data.title,
      code: data.code || null,
      options: data.options,
      correctAnswer: Number(data.correctAnswer),
    });

    res.status(201).json({
      message: "❓ Question added successfully",
      insertedId: question._id,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE QUESTION (🔥 MISSING) ================= */
exports.updateQuestion = async (req, res, next) => {
  try {
    await dbConnect();

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        options: req.body.options,
        correctAnswer: Number(req.body.correctAnswer),
        type: req.body.type,
        code: req.body.type === "output" ? req.body.code : null,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated successfully" });
  } catch (err) {
    next(err);
  }
};

/* ================= GET SINGLE QUESTION (🔥 MISSING) ================= */
exports.getSingleQuestion = async (req, res, next) => {
  try {
    await dbConnect();

    const question = await Question.findById(req.params.id).lean();
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const subject = await Subject.findById(question.subjectId).lean();

    res.json({
      ...question,
      subjectName: subject?.displayName || subject?.name || "Unknown",
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET ADMIN QUESTIONS ================= */
exports.getAdminQuestions = async (req, res, next) => {
  try {
    await dbConnect();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const subjectId = req.query.subjectId;

    const query = {};
    if (search) query.title = new RegExp(search, "i");
    if (subjectId && subjectId !== "all") query.subjectId = subjectId;

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const subjects = await Subject.find({}).lean();
    const subjectMap = {};
    subjects.forEach(
      (s) => (subjectMap[s._id.toString()] = s.displayName || s.name)
    );

    const final = questions.map((q) => ({
      ...q,
      subjectName: subjectMap[q.subjectId] || "Unknown",
    }));

    res.json({
      questions: final,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= FRONTEND QUESTIONS ================= */
exports.getFrontendQuestions = async (req, res, next) => {
  try {
    await dbConnect();

    const search = req.query.search || "";
    const subjectId = req.query.subjectId;

    const query = {};
    if (search) query.title = new RegExp(search, "i");
    if (subjectId && subjectId !== "all") query.subjectId = subjectId;

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ questions, total: questions.length });
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE QUESTION ================= */
exports.deleteQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Question deleted" });
  } catch (err) {
    next(err);
  }
};
