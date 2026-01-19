const express = require("express");
const router = express.Router();
const questionCtrl = require("../controllers/question.controller");
/* ADMIN */ router.post("/questions", questionCtrl.addQuestion);
router.put("/questions/:id", questionCtrl.updateQuestion);
router.get("/questions/:id", questionCtrl.getSingleQuestion);
router.get("/questions", questionCtrl.getAdminQuestions);
router.delete("/questions/:id", questionCtrl.deleteQuestion);
/* FRONTEND */ router.get(
  "/questions-public",
  questionCtrl.getFrontendQuestions,
);
module.exports = router;
