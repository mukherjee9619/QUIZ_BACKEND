const mongoose = require('mongoose');

async function dbConnect() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizDB';
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

module.exports = dbConnect;
