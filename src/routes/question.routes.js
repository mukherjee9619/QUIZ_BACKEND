const express = require("express");
const router = express.Router();

/* ================= CONTROLLERS ================= */
const questionCtrl = require("../controllers/question.controller");

/* ================= MIDDLEWARE ================= */
const uploadJson = require("../middlewares/uploadJson");

/* =================================================
   ADMIN ROUTES
================================================= */

/**
 * @route   POST /api/questions
 * @desc    Add single question (duplicate-safe)
 */
router.post("/questions", questionCtrl.addQuestion);

/**
 * @route   PUT /api/questions/:id
 * @desc    Update question
 */
router.put("/questions/:id", questionCtrl.updateQuestion);

/**
 * @route   GET /api/questions/:id
 * @desc    Get single question (admin)
 */
router.get("/questions/:id", questionCtrl.getSingleQuestion);

/**
 * @route   GET /api/questions
 * @desc    Get all questions (admin pagination + search)
 * @query   page, limit, search, subjectId
 */
router.get("/questions", questionCtrl.getAdminQuestions);

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 */
router.delete("/questions/:id", questionCtrl.deleteQuestion);

/**
 * @route   POST /api/questions/import-json
 * @desc    Import MCQ + OUTPUT questions from JSON
 * @body    form-data: file (json), subjectId
 */
router.post(
  "/questions/import-json",
  uploadJson.single("file"),
  questionCtrl.importQuestionsFromJson
);

/* =================================================
   FRONTEND / PUBLIC ROUTES
================================================= */

/**
 * @route   GET /api/questions-public
 * @desc    Get questions for exam / quiz
 * @query   subjectId, search
 */
router.get("/questions-public", questionCtrl.getFrontendQuestions);

module.exports = router;
