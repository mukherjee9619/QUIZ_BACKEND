const express = require("express");
const cors = require("cors");

const authRoutes = require("../src/routes/auth.routes");
const adminRoutes = require("../src/routes/admin.routes");
const subjectRoutes = require("../src/routes/subject.routes");
const activityRoutes = require("../src/routes/activity.routes");
const questionRoutes = require("../src/routes/question.routes");
const resultRoutes = require("../src/routes/result.routes");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api", authRoutes);
app.use("/api", questionRoutes);
app.use("/api", resultRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", subjectRoutes);
app.use("/api/admin", activityRoutes);
app.use("/api/admin", questionRoutes);

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
