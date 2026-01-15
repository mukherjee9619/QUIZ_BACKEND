require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const subjectRoutes = require("./routes/subject.routes");
const activityRoutes = require("./routes/activity.routes");
const questionRoutes = require("./routes/question.routes");
const resultRoutes = require("./routes/result.routes");

const app = express();

/* ================= MIDDLEWARE ================= */
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools like Postman (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

/* ================= START ================= */
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected (Mongoose)");

    // 🔥 VERY IMPORTANT
    app.locals.db = mongoose.connection.db;

    app.listen(8081, () => {
      console.log("🚀 Server running on port 8081");
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
  }
}

startServer();
