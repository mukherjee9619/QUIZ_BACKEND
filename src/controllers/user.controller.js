const generateResultPDF = require("../utils/resultPdf");
const { sendResultEmailWithPDF } = require("../middleware/mailer");
const dbConnect = require("../config/db");




/* ===================================================
   EMAIL RESULT PDF AGAIN
=================================================== */
exports.emailResultPDF = async (req, res, next) => {
  try {
    await dbConnect();
    const {
      email,
      userName,
      subjectName,
      questions,
      answers,
      total,
      attempted,
      correct,
      wrong,
      score,
      percentage,
      timeTakenSec,
    } = req.body;

    if (!email || !subjectName || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid result data" });
    }

    const pdfBuffer = await generateResultPDF({
      userName,
      email,
      subjectName,
      questions,
      answers,
      total,
      attempted,
      correct,
      wrong,
      score,
      percentage,
      timeTakenSec,
    });

    await sendResultEmailWithPDF(email, pdfBuffer, subjectName);

    res.json({ message: "📧 Result emailed successfully" });
  } catch (err) {
    next(err);
  }
};

