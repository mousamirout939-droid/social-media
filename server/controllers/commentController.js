const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const emitNotification = require("../utils/emitNotification");

// @route   POST /api/comments/:postId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text,
  });

  post.commentCount += 1;
  await post.save();

  if (!post.author.equals(req.user._id)) {
    const notification = await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: "comment",
      post: post._id,
      comment: comment._id,
    });
    await notification.populate("sender", "name username avatar");
    emitNotification(req, post.author, notification);
  }

  await comment.populate("author", "name username avatar");

  res.status(201).json({ success: true, comment });
});

// @route   GET /api/comments/:postId?page=1&limit=10
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar"),
    Comment.countDocuments({ post: req.params.postId }),
  ]);

  res.status(200).json({
    success: true,
    comments,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + comments.length < total,
  });
});

// @route   DELETE /api/comments/:id
// @access  Private (owner only)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (!comment.author.equals(req.user._id)) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  await comment.deleteOne();

  res.status(200).json({ success: true, message: "Comment deleted" });
});

module.exports = { addComment, getComments, deleteComment };
