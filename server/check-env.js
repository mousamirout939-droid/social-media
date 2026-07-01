require('dotenv').config();
console.log("Checking environment variables...");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("Resolved URI exists:", !!(process.env.MONGO_URI || process.env.MONGODB_URI));