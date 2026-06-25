const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const emitNotification = require("../utils/emitNotification");

// @route   GET /api/users/:username
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() })
    .populate("followers", "name username avatar")
    .populate("following", "name username avatar");

  if (!user) throw new ApiError(404, "User not found");

  const postCount = await Post.countDocuments({ author: user._id });

  res.status(200).json({
    success: true,
    user: {
      ...user.toSafeObject(),
      postCount,
      isFollowing: req.user ? user.followers.some((f) => f._id.equals(req.user._id)) : false,
    },
  });
});

// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, website } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (website !== undefined) user.website = website;

  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image");

  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }

  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route   PUT /api/users/cover
// @access  Private
const updateCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image");

  const user = await User.findById(req.user._id);

  if (user.coverImage?.publicId) {
    await cloudinary.uploader.destroy(user.coverImage.publicId).catch(() => {});
  }

  user.coverImage = { url: req.file.path, publicId: req.file.filename };
  await user.save();

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === String(req.user._id)) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const currentUser = await User.findById(req.user._id);
  const alreadyFollowing = currentUser.following.some((id) => id.equals(targetId));

  if (alreadyFollowing) {
    currentUser.following = currentUser.following.filter((id) => !id.equals(targetId));
    targetUser.followers = targetUser.followers.filter((id) => !id.equals(req.user._id));
  } else {
    currentUser.following.push(targetId);
    targetUser.followers.push(req.user._id);
    const notification = await Notification.create({
      recipient: targetId,
      sender: req.user._id,
      type: "follow",
    });
    await notification.populate("sender", "name username avatar");
    emitNotification(req, targetId, notification);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    success: true,
    isFollowing: !alreadyFollowing,
    followerCount: targetUser.followers.length,
  });
});

// @route   GET /api/users/search?q=term
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  const regex = new RegExp(q.trim(), "i");
  const users = await User.find({
    $or: [{ username: regex }, { name: regex }],
  })
    .select("name username avatar bio")
    .limit(20);

  res.status(200).json({ success: true, users });
});

// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const excludeIds = [req.user._id, ...currentUser.following];

  const suggestions = await User.find({ _id: { $nin: excludeIds } })
    .select("name username avatar bio")
    .limit(5);

  res.status(200).json({ success: true, users: suggestions });
});

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  toggleFollow,
  searchUsers,
  getSuggestions,
};
