const Message = require("../models/Message");
const Task = require("../models/Task");
const { emitMessage } = require("../socket/socketHandlers"); // Adjust path

// @desc    Send a message related to a task
// @route   POST /api/messages
// @access  Private (Poster or Accepter only)
const sendMessage = async (req, res) => {
  const { taskId, content } = req.body;

  if (!taskId || !content) {
    return res
      .status(400)
      .json({ message: "Task ID and content are required" });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the sender is either the poster or the acceptor
    const isPoster = task.postedBy.toString() === req.user._id.toString();
    const isAccepter =
      task.acceptedBy && task.acceptedBy.toString() === req.user._id.toString();

    if (!isPoster && !isAccepter) {
      return res
        .status(403)
        .json({ message: "Not authorized to send messages for this task" });
    }

    // Determine receiver
    let receiverId;
    if (isPoster && task.acceptedBy) {
      receiverId = task.acceptedBy;
    } else if (isAccepter) {
      receiverId = task.postedBy;
    } else {
      // Cannot send message if task is not accepted yet (no receiver)
      return res
        .status(400)
        .json({ message: "Cannot send message until task is accepted" });
    }

    const message = new Message({
      taskId,
      senderId: req.user._id,
      receiverId: receiverId,
      content,
    });

    const savedMessage = await message.save();
    // Populate sender details for emission
    await savedMessage.populate("senderId", "name");

    // Emit message via Socket.IO to the task room
    emitMessage(taskId.toString(), savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Server Error sending message" });
  }
};

// @desc    Get messages for a specific task
// @route   GET /api/messages/task/:taskId
// @access  Private (Poster or Accepter only)
const getTaskMessages = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the user requesting messages is either the poster or the acceptor
    const isPoster = task.postedBy.toString() === req.user._id.toString();
    const isAccepter =
      task.acceptedBy && task.acceptedBy.toString() === req.user._id.toString();

    if (!isPoster && !isAccepter) {
      return res
        .status(403)
        .json({ message: "Not authorized to view messages for this task" });
    }

    const messages = await Message.find({ taskId })
      .populate("senderId", "name") // Get sender's name
      .sort({ timestamp: 1 }); // Oldest first

    res.json(messages);
  } catch (error) {
    console.error("Get Task Messages Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Task not found (invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error fetching messages" });
  }
};

module.exports = { sendMessage, getTaskMessages };
