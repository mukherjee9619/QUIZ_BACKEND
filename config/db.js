const mongoose = require("mongoose");

let isConnected = false;

async function dbConnect() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("❌ MONGO_URI not defined");
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
}

module.exports = dbConnect;
