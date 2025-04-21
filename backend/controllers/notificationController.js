const Notification = require("../models/Notification"); // Ensure path to model is correct

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    // Ensure req.user exists from the 'protect' middleware
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized, user data missing" });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20); // Limit results for performance

    res.json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Server Error fetching notifications" });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized, user data missing" });
    }

    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure the user owns the notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this notification" });
    }

    // Avoid unnecessary database write if already read
    if (notification.isRead) {
      return res.json({ message: "Notification already marked as read" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification }); // Optionally return updated notification
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    // Handle potential CastError for invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Notification not found (invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error updating notification" });
  }
};

// --- Make absolutely sure this export is correct ---
module.exports = {
  getNotifications, // Exported function
  markAsRead, // Exported function
};
