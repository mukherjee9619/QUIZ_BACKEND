const express = require("express");
const cors = require("cors");

const dbConnect = require("./config/dbConnect");

const authRoutes = require("../routes/auth.routes");
const adminRoutes = require("../routes/admin.routes");
const subjectRoutes = require("../routes/subject.routes");
const activityRoutes = require("../routes/activity.routes");
const questionRoutes = require("../routes/question.routes");
const resultRoutes = require("../routes/result.routes");

const app = express();

/* ================= DB CONNECT ================= */
dbConnect();

/* ================= MIDDLEWARE ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://your-frontend.vercel.app" // 👈 ADD THIS
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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
  res.status(500).json({ message: "Internal server error" });
});

/* ================= EXPORT APP ================= */
module.exports = app;   // 🔥 VERY IMPORTANT
