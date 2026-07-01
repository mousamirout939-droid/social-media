const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  try {
    console.log("====================================");
    console.log("MongoDB URI configured:", Boolean(mongoUri));
    console.log("====================================");

    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    return true;
  } catch (err) {
    console.error("❌ Full MongoDB Error:");
    console.error(err);
    return false;
  }
};

module.exports = connectDB;