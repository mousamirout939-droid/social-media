const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const emitNotification = require("../utils/emitNotification");

const POPULATE_AUTHOR = "name username avatar isVerified";

// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { text, tags } = req.body;

  if (!text && !req.file) {
    throw new ApiError(400, "A post needs text or an image");
  }

  const post = await Post.create({
    author: req.user._id,
    text,
    tags: tags ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
    image: req.file ? { url: req.file.path, publicId: req.file.filename } : undefined,
  });

  await post.populate("author", POPULATE_AUTHOR);

  res.status(201).json({ success: true, post });
});

// @route   GET /api/posts/feed?page=1&limit=10
// @access  Private
const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id);
  const authorIds = [...currentUser.following, currentUser._id];

  const [posts, total] = await Promise.all([
    Post.find({ author: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", POPULATE_AUTHOR),
    Post.countDocuments({ author: { $in: authorIds } }),
  ]);

  res.status(200).json({
    success: true,
    posts,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// @route   GET /api/posts/explore?page=1&limit=10
// @access  Public
const getExplorePosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", POPULATE_AUTHOR),
    Post.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    posts,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// @route   GET /api/posts/user/:username?page=1&limit=10
// @access  Public
const getUserPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw new ApiError(404, "User not found");

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", POPULATE_AUTHOR),
    Post.countDocuments({ author: user._id }),
  ]);

  res.status(200).json({
    success: true,
    posts,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", POPULATE_AUTHOR);
  if (!post) throw new ApiError(404, "Post not found");
  res.status(200).json({ success: true, post });
});

// @route   DELETE /api/posts/:id
// @access  Private (owner only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.author.equals(req.user._id)) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId).catch(() => {});
  }

  await Comment.deleteMany({ post: post._id });
  await Notification.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(200).json({ success: true, message: "Post deleted" });
});

// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => !id.equals(req.user._id));
  } else {
    post.likes.push(req.user._id);
    if (!post.author.equals(req.user._id)) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "like",
        post: post._id,
      });
      await notification.populate("sender", "name username avatar");
      emitNotification(req, post.author, notification);
    }
  }

  await post.save();
  res.status(200).json({
    success: true,
    isLiked: !alreadyLiked,
    likeCount: post.likes.length,
  });
});

// @route   PUT /api/posts/:id/save
// @access  Private
const toggleSave = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedPosts.some((id) => id.equals(post._id));

  if (alreadySaved) {
    user.savedPosts = user.savedPosts.filter((id) => !id.equals(post._id));
  } else {
    user.savedPosts.push(post._id);
  }

  await user.save();
  res.status(200).json({ success: true, isSaved: !alreadySaved });
});

// @route   GET /api/posts/saved/all
// @access  Private
const getSavedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "savedPosts",
    populate: { path: "author", select: POPULATE_AUTHOR },
    options: { sort: { createdAt: -1 } },
  });

  res.status(200).json({ success: true, posts: user.savedPosts });
});

module.exports = {
  createPost,
  getFeed,
  getExplorePosts,
  getUserPosts,
  getPostById,
  deletePost,
  toggleLike,
  toggleSave,
  getSavedPosts,
};
