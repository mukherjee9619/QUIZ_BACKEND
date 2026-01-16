const Subject = require("../models/Subject");
const Question = require("../models/Question");
const User = require("../models/User");
const { default: dbConnect } = require("../config/db");


/* ===================================================
   GET ADMIN DASHBOARD STATS
=================================================== */
exports.getStats = async (req, res, next) => {
  try {
    await dbConnect();
    const subjects = await Subject.countDocuments();
    const questions = await Question.countDocuments();
    const users = await User.countDocuments();
    const results = await Result.countDocuments();

    res.json({ subjects, questions, users, results });
  } catch (err) {
    next(err);
  }
};
