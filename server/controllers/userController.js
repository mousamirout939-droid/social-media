const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const emitNotification = require("../utils/emitNotification");

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.params.username) throw new ApiError(400, "Username is required");

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
      isFollowing: req.user ? user.followers.some((f) => f._id.equals(req.user._id)) : false 
    } 
  });
});

// Update Profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, website } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) throw new ApiError(404, "User not found");
  
  Object.assign(user, { name, bio, location, website });
  await user.save();
  
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// Update Avatar
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

// Update Cover Image
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

// Toggle Follow/Unfollow
const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(targetId)) throw new ApiError(400, "Invalid User ID");
  if (targetId === String(currentUserId)) throw new ApiError(400, "You cannot follow yourself");

  const isFollowing = await User.exists({ _id: currentUserId, following: targetId });

  if (isFollowing) {
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
  } else {
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
    
    const notification = await Notification.create({ recipient: targetId, sender: currentUserId, type: "follow" });
    const populatedNotif = await notification.populate("sender", "name username avatar");
    emitNotification(req, targetId, populatedNotif);
  }

  const updatedTarget = await User.findById(targetId).select("followers");
  res.status(200).json({ 
    success: true, 
    isFollowing: !isFollowing, 
    followerCount: updatedTarget.followers.length 
  });
});

// Search Users
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  const query = q.trim();
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } }
    ]
  })
  .select("name username avatar bio")
  .limit(20);

  res.status(200).json({ success: true, users });
});

// Get Suggestions
const getSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following");
  const suggestions = await User.find({ 
    _id: { $nin: [req.user._id, ...currentUser.following] } 
  })
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