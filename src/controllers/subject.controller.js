

const Subject = require("../models/Subject");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");
const dbConnect = require("../config/db");

/* ===================================================
   ADD SUBJECT
=================================================== */
exports.addSubject = async (req, res, next) => {
  try {
    await dbConnect();
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const normalizedName = name.trim().toLowerCase();

    const existing = await Subject.findOne({ name: normalizedName });
    if (existing) {
      return res.status(409).json({
        message: "⚠️ Subject already exists!",
      });
    }

    const subject = await Subject.create({
      name: normalizedName,
      description: description?.trim() || "",
    });

    /* 🔔 ACTIVITY LOG */
    try {
      await logActivity(req.app.locals.db, {
        actorType: "ADMIN",
        action: ACTIVITY.SUBJECT.CREATED,
        entityType: "SUBJECT",
        entityId: subject._id,
        message: `Subject "${name}" created`,
        metadata: {
          subjectId: subject._id,
          name,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    res.status(201).json({
      message: "📘 Subject created!",
      subject,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   EDIT SUBJECT
=================================================== */
exports.editSubject = async (req, res, next) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    /* 🔔 ACTIVITY LOG */
    try {
      await logActivity(req.app.locals.db, {
        actorType: "ADMIN",
        action: ACTIVITY.SUBJECT.UPDATED,
        entityType: "SUBJECT",
        entityId: subject._id,
        message: `Subject updated: ${name}`,
        metadata: {
          subjectId: subject._id,
          name,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    res.json({
      message: "Subject updated",
      subject,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET SINGLE SUBJECT
=================================================== */
exports.getSingleSubject = async (req, res, next) => {
  try {
    await dbConnect();
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET ALL SUBJECTS (SEARCH + PAGINATION)
=================================================== */
exports.getAllSubjects = async (req, res, next) => {
  try {
    await dbConnect();
    const page = parseInt(req.query.page) || 1;
    const limitParam = req.query.limit;
    const search = req.query.search?.trim() || "";

    const limit =
      limitParam === undefined || parseInt(limitParam) === 0
        ? null
        : parseInt(limitParam);

    /* 🔍 SEARCH FIX (name + displayName) */
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { displayName: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const total = await Subject.countDocuments(query);

    let subjectsQuery = Subject.find(query).sort({ createdAt: -1 });

    if (limit) {
      subjectsQuery = subjectsQuery
        .skip((page - 1) * limit)
        .limit(limit);
    }

    const subjects = await subjectsQuery;

    res.json({
      subjects,
      totalSubjects: total,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      currentPage: limit ? page : 1,
      limit: limit || "ALL",
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   DELETE SUBJECT
=================================================== */
exports.deleteSubject = async (req, res, next) => {
  try {
    await dbConnect();
    const { id } = req.params;

    // 1️⃣ Check subject exists
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // 2️⃣ OPTIONAL: delete related questions
    // (Highly recommended to avoid orphan questions)
    const Question = require("../models/Question");
    await Question.deleteMany({ subjectId: subject._id });

    // 3️⃣ Delete subject
    await subject.deleteOne();

    // 4️⃣ Activity log (safe)
    try {
      await logActivity(req.app.locals.db, {
        actorType: "ADMIN",
        action: ACTIVITY.SUBJECT.DELETED,
        entityType: "SUBJECT",
        entityId: subject._id,
        message: `Subject deleted: ${subject.name}`,
        metadata: {
          subjectId: subject._id,
          name: subject.name,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    res.json({
      message: "🗑️ Subject deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

