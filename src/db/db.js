const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI;
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectToDatabase;
