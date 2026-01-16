const { ObjectId } = require("mongodb");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");
const { default: dbConnect } = require("../config/db");


/* ===================================================
   ADD QUESTION (OLD FORMAT)
   POST /api/admin/questions
=================================================== */
exports.addQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;
    const data = req.body;

    if (!data.subjectId || !data.title) {
      return res.status(400).json({
        message: "Subject and title required",
      });
    }

    if (!Array.isArray(data.options) || data.options.length !== 4) {
      return res.status(400).json({
        message: "Exactly 4 options are required",
      });
    }

    if (
      typeof data.correctAnswer !== "number" ||
      data.correctAnswer < 0 ||
      data.correctAnswer > 3
    ) {
      return res.status(400).json({
        message: "Correct answer must be between 0 and 3",
      });
    }

    const questionDoc = {
      subjectId: data.subjectId,
      questionId: data.questionId || null,
      language: data.language || null,
      type: data.type || "mcq",
      title: data.title,
      code: data.code || null,
      options: data.options,
      correctAnswer: Number(data.correctAnswer),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(questionDoc);

    logActivity(db, {
      actorType: "ADMIN",
      action: ACTIVITY.QUESTION.ADDED,
      entityType: "QUESTION",
      entityId: result.insertedId,
      message: "New question added",
      metadata: {
        subjectId: data.subjectId,
      },
    });

    res.status(201).json({
      message: "❓ Question added successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   UPDATE QUESTION
   PUT /api/admin/questions/:id
=================================================== */
exports.updateQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;
    const { id } = req.params;
    const data = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Question ID" });
    }

    const updateFields = {
      title: data.title,
      options: data.options,
      correctAnswer: Number(data.correctAnswer),
      type: data.type,
      code: data.type === "output" ? data.code : null,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("questions")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated successfully" });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET SINGLE QUESTION
   GET /api/admin/questions/:id
=================================================== */
exports.getSingleQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;
    const { id } = req.params;

    const question = await db.collection("questions").findOne({
      _id: new ObjectId(id),
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const subject = await db.collection("subjects").findOne({
      _id: new ObjectId(question.subjectId),
    });

    res.json({
      ...question,
      subjectName: subject?.displayName || subject?.name || "Unknown",
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET QUESTIONS (ADMIN)
   GET /api/admin/questions
=================================================== */
exports.getAdminQuestions = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;

    const page = parseInt(req.query.page) || 1;
    const limitParam = req.query.limit || "10";
    const search = req.query.search || "";
    const subjectId = req.query.subjectId;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (subjectId && subjectId !== "all") {
      query.subjectId = subjectId;
    }

    const subjects = await db.collection("subjects").find({}).toArray();
    const subjectMap = {};
    subjects.forEach(
      (s) => (subjectMap[s._id.toString()] = s.displayName || s.name)
    );

    const total = await db.collection("questions").countDocuments(query);

    let cursor = db.collection("questions").find(query).sort({ createdAt: -1 });

    let questions;
    if (limitParam === "all") {
      questions = await cursor.toArray();
    } else {
      const limit = parseInt(limitParam);
      questions = await cursor
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
    }

    const final = questions.map((q) => ({
      ...q,
      subjectName: subjectMap[q.subjectId] || "Unknown",
    }));

    res.json({
      questions: final,
      total,
      totalPages:
        limitParam === "all" ? 1 : Math.ceil(total / parseInt(limitParam)),
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   FRONTEND QUESTIONS
   GET /api/questions
=================================================== */
exports.getFrontendQuestions = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;

    const search = req.query.search || "";
    const subjectId = req.query.subjectId;

    const query = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (subjectId && subjectId !== "all") query.subjectId = subjectId;

    const subjects = await db.collection("subjects").find({}).toArray();
    const subjectMap = {};
    subjects.forEach(
      (s) => (subjectMap[s._id.toString()] = s.displayName || s.name)
    );

    const questions = await db
      .collection("questions")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const final = questions.map((q) => ({
      ...q,
      subjectName: subjectMap[q.subjectId] || "Unknown",
    }));

    res.json({ questions: final, total: final.length });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   DELETE QUESTION
   DELETE /api/admin/questions/:id
=================================================== */
exports.deleteQuestion = async (req, res, next) => {
  try {
    await dbConnect();
    const db = req.app.locals.db;
    const { id } = req.params;

    await db.collection("questions").deleteOne({
      _id: new ObjectId(id),
    });

    res.json({ message: "🗑️ Question deleted" });
  } catch (err) {
    next(err);
  }
};
