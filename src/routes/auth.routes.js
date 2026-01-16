const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth.controller");


// 🔍 DEBUG (temporary – confirms fix)
console.log("authCtrl.login:", typeof authCtrl.login);

// public
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/auth/forgot-password", authCtrl.forgotPassword);
router.post("/auth/verify-otp", authCtrl.verifyOtp);
router.post("/auth/reset-password", authCtrl.resetPassword);



module.exports = router;
