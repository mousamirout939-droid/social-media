const dns = require("node:dns/promises");
// Force Node to use Google's public DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

// Parse allowed origins
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return (
    allowedOrigins.includes(origin) ||
    /\.vercel\.app$/i.test(origin) ||
    /\.onrender\.com$/i.test(origin) ||
    /localhost(:\d+)?$/i.test(origin)
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(helmet());

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

const onlineUsers = new Map();
io.on("connection", (socket) => {
  socket.on("identify", (userId) => {
    if (userId) onlineUsers.set(userId, socket.id);
  });
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) onlineUsers.delete(userId);
    }
  });
});
app.set("onlineUsers", onlineUsers);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate Limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter);
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api", apiLimiter);

// DB Guard
let dbReady = false;
app.use((req, res, next) => {
  if (req.method === "OPTIONS" || req.path === "/" || req.path === "/api/health") return next();
  if (!dbReady) return res.status(503).json({ success: false, message: "Database unavailable" });
  next();
});

// Routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Bloom API is running" }));
app.get("/api/health", (req, res) => res.status(200).json({ success: true, status: "ok", dbReady, uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Bloom server running on port ${PORT}`);
  connectDB().then((ready) => { dbReady = ready; });
});

process.on("unhandledRejection", (err) => console.error("Unhandled Rejection:", err.message));