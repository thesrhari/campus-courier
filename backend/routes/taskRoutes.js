const express = require("express");
const {
  createTask,
  getOpenTasks,
  getMyPostedTasks,
  getMyAcceptedTasks,
  getTaskById,
  acceptTask,
  completeTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// All task routes require authentication
router.use(protect);

router.route("/").post(createTask).get(getOpenTasks); // Get open tasks available for acceptance

router.get("/my-posted", getMyPostedTasks);
router.get("/my-accepted", getMyAcceptedTasks);

router.route("/:taskId").get(getTaskById);

router.put("/:taskId/accept", acceptTask);
router.put("/:taskId/complete", completeTask); // Only poster should be able to call this (checked in controller)

module.exports = router;
