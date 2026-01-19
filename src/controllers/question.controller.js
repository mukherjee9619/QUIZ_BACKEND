const Question = require("../models/Question");
const Subject = require("../models/Subject");
const dbConnect = require("../config/db");
const fs = require("fs");

/* =========================================================
   ADD SINGLE QUESTION (WITH DUPLICATE CHECK)
========================================================= */
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

    /* 🔍 DUPLICATE CHECK */
    const duplicateQuery = {
      subjectId: data.subjectId,
      title: data.title,
      type: data.type || "mcq",
      language: data.language || null,
    };

    if (data.type === "output" && data.code?.content) {
      duplicateQuery["code.content"] = data.code.content;
    }

    const exists = await Question.findOne(duplicateQuery);
    if (exists) {
      return res.status(409).json({
        message: "⚠️ Duplicate question already exists",
      });
    }

    const question = await Question.create({
      subjectId: data.subjectId,
      questionId: data.questionId || null,
      language: data.language || null,
      type: data.type || "mcq",
      title: data.title,
      code: data.type === "output" ? data.code : null,
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

/* =========================================================
   IMPORT QUESTIONS FROM JSON (DUPLICATE SAFE)
========================================================= */
// exports.importQuestionsFromJson = async (req, res, next) => {
//   try {
//     await dbConnect();

//     if (!req.file) {
//       return res.status(400).json({ message: "JSON file required" });
//     }

//     const rawData = fs.readFileSync(req.file.path, "utf-8");
//     const questions = JSON.parse(rawData);

//     if (!Array.isArray(questions)) {
//       return res.status(400).json({ message: "JSON must be an array" });
//     }

//     let inserted = 0;
//     let skipped = 0;
//     let duplicates = 0;

//     const bulk = [];

//     for (const q of questions) {
//       if (
//         !q.title ||
//         !q.type ||
//         !Array.isArray(q.options) ||
//         q.options.length !== 4 ||
//         q.correctAnswer === undefined
//       ) {
//         skipped++;
//         continue;
//       }

//       /* 🔍 DUPLICATE CHECK */
//       const duplicateQuery = {
//         subjectId: req.body.subjectId,
//         title: q.title,
//         type: q.type,
//         language: q.language || null,
//       };

//       if (q.type === "output" && q.code?.content) {
//         duplicateQuery["code.content"] = q.code.content;
//       }

//       const exists = await Question.findOne(duplicateQuery);
//       if (exists) {
//         duplicates++;
//         continue;
//       }

//       let codeField = null;
//       if (q.type === "output") {
//         if (!q.code || !q.code.content) {
//           skipped++;
//           continue;
//         }
//         codeField = {
//           content: q.code.content,
//           language: q.code.language || q.language || "c",
//         };
//       }

//       bulk.push({
//         subjectId: req.body.subjectId,
//         questionId: q.id || null,
//         language: q.language || null,
//         type: q.type,
//         title: q.title,
//         code: codeField,
//         options: q.options,
//         correctAnswer: Number(q.correctAnswer),
//       });
//     }

//     if (bulk.length) {
//       await Question.insertMany(bulk);
//       inserted = bulk.length;
//     }

//     fs.unlinkSync(req.file.path);

//     res.json({
//       message: "📥 JSON import completed",
//       inserted,
//       skipped,
//       duplicates,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/* =========================================================
   UPDATE QUESTION
========================================================= */
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

    res.json({ message: "✏️ Question updated successfully" });
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GET SINGLE QUESTION
========================================================= */
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

/* =========================================================
   GET ADMIN QUESTIONS (PAGINATION + SEARCH)
========================================================= */
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

/* =========================================================
   FRONTEND QUESTIONS
========================================================= */
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

/* =========================================================
   DELETE QUESTION
========================================================= */
exports.deleteQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Question deleted" });
  } catch (err) {
    next(err);
  }
};
