const express = require("express");

// --- Make absolutely sure this import is correct ---
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController"); // Correctly imports the functions

const { protect } = require("../middleware/authMiddleware"); // Ensure protect middleware is imported
const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(protect);

// --- Define routes using the imported controller functions ---

// GET /api/notifications - Fetch user's notifications
router.get("/", getNotifications); // Uses the imported getNotifications function

// PUT /api/notifications/:notificationId/read - Mark a notification as read
router.put("/:notificationId/read", markAsRead); // Uses the imported markAsRead function

module.exports = router; // Export the configured router
