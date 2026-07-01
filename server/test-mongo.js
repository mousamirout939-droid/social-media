require('dotenv').config();
const mongoose = require("mongoose");

console.log("Attempting to connect to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ CONNECTION FAILED!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    process.exit(1);
  });