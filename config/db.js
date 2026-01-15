const mongoose = require("mongoose");

let isConnected = false;

async function dbConnect() {
  if (isConnected) return;

  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error", err);
    throw err;
  }
}

module.exports = dbConnect;
