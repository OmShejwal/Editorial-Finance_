const logNotification = (userId, message) => {
  console.log(`[Notification for ${userId}]: ${message}`);
  // In a real system, you'd save this to a Notification model
  // or send via Socket.io / Email / Push
};

module.exports = {
  logNotification
};
