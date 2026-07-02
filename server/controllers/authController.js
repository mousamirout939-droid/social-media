const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const {
  createFallbackUser,
  findFallbackUserByEmailOrUsername,
} = require("../utils/authFallback");
const { ensureDefaultAdmin } = require("../utils/ensureAdmin");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: (parseInt(process.env.COOKIE_EXPIRES_IN, 10) || 30) * 24 * 60 * 60 * 1000,
};

const sendAuthResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token, // also returned for clients that prefer header-based auth
    user: user.toSafeObject(),
  });
};

// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    const existing = findFallbackUserByEmailOrUsername(email) || findFallbackUserByEmailOrUsername(username);
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      throw new ApiError(409, `That ${field} is already in use`);
    }

    const user = createFallbackUser({ name, username, email, password });
    sendAuthResponse(user, 201, res);
    return;
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    throw new ApiError(409, `That ${field} is already in use`);
  }

  const user = await User.create({ name, username, email, password });
  sendAuthResponse(user, 201, res);
});

// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    const user = findFallbackUserByEmailOrUsername(emailOrUsername);
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    sendAuthResponse(user, 200, res);
    return;
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
  }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.loginCount += 1;
  await user.save();

  sendAuthResponse(user, 200, res);
});

// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out" });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

const getAdminStats = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const totalUsers = await User.countDocuments();
  const totalLogins = await User.aggregate([{ $group: { _id: null, total: { $sum: "$loginCount" } } }]);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name username email createdAt");

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalLogins: totalLogins[0]?.total || 0,
      recentUsers,
    },
  });
});

module.exports = { registerUser, loginUser, logoutUser, getMe, getAdminStats };
