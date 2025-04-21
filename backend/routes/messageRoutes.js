const express = require("express");
const {
  sendMessage,
  getTaskMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// All message routes require authentication
router.use(protect);

router.post("/", sendMessage);
router.get("/task/:taskId", getTaskMessages);

module.exports = router;
