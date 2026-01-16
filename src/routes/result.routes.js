const express = require("express");
const router = express.Router();
const resultCtrl = require("../controllers/user.controller");


// email pdf again (optional)
router.post("/result/email", resultCtrl.emailResultPDF);



module.exports = router;
