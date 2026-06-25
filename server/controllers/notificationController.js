const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// @route   GET /api/notifications?page=1&limit=20
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name username avatar")
      .populate("post", "text image"),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + notifications.length < total,
  });
});

// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// @route   PUT /api/notifications/:id/read
// @access  Private
const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { read: true } }
  );
  res.status(200).json({ success: true });
});

module.exports = { getNotifications, markAllRead, markOneRead };
