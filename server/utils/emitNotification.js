/**
 * Emits a "notification" event to a specific user's socket if they are
 * currently connected. Safe no-op if the user is offline or sockets
 * aren't initialized (e.g. in tests).
 *
 * @param {import('express').Request} req
 * @param {string} recipientId
 * @param {object} notification - populated notification document
 */
const emitNotification = (req, recipientId, notification) => {
  try {
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (!io || !onlineUsers) return;

    const socketId = onlineUsers.get(String(recipientId));
    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }
  } catch {
    // Never let a socket emit failure break the HTTP response
  }
};

module.exports = emitNotification;
