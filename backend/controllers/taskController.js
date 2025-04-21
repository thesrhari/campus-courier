// backend/controllers/taskController.js
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/socketHandlers"); // Adjust path if needed

// --- Define ALL Controller Functions FIRST ---

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const {
    title,
    price,
    deliveryLocation,
    deadline,
    category,
    stationeryDetails,
    printoutDetails,
  } = req.body;

  if (!price || !deliveryLocation || !category) {
    return res
      .status(400)
      .json({ message: "Price, Delivery Location, and Category required" });
  }

  let taskData = {
    title,
    price: Number(price),
    deliveryLocation,
    deadline: deadline ? new Date(deadline) : null,
    category,
    postedBy: req.user._id,
    status: "Open",
  };

  try {
    if (category === "Stationery") {
      if (
        !stationeryDetails ||
        !Array.isArray(stationeryDetails.items) ||
        stationeryDetails.items.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Stationery items are required." });
      }
      const validItems = stationeryDetails.items
        .map((item) => ({
          name: item.name?.trim(),
          quantity: Number(item.quantity) || 0,
        }))
        .filter((item) => item.name && item.quantity > 0);

      if (validItems.length === 0) {
        return res
          .status(400)
          .json({ message: "Add at least one valid stationery item." });
      }
      taskData.stationeryDetails = {
        items: validItems,
        additionalInfo: stationeryDetails.additionalInfo || "",
      };
    } else if (category === "Printouts") {
      if (!printoutDetails || !printoutDetails.fileName) {
        return res
          .status(400)
          .json({ message: "File details required for Printouts." });
      }
      taskData.printoutDetails = {
        fileUrl: printoutDetails.fileUrl || null,
        fileName: printoutDetails.fileName,
        fileType: printoutDetails.fileType || null,
        pages: printoutDetails.pages ? Number(printoutDetails.pages) : null,
        color: printoutDetails.color || false,
        doubleSided: printoutDetails.doubleSided || false,
        additionalInfo: printoutDetails.additionalInfo || "",
      };
    } else {
      return res.status(400).json({ message: "Invalid task category." });
    }

    const task = new Task(taskData);
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error("Create Task Error:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server Error creating task" });
  }
};

// @desc    Get all open tasks
// @route   GET /api/tasks
// @access  Private
const getOpenTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: "Open" })
      .populate("postedBy", "name") // Populate only name for card list
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get Open Tasks Err:", error);
    res.status(500).json({ message: "Server Error fetching open tasks" });
  }
};

// @desc    Get tasks posted by the logged-in user
// @route   GET /api/tasks/my-posted
// @access  Private
const getMyPostedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ postedBy: req.user._id })
      .populate("acceptedBy", "name") // Populate acceptor's name
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get My Posted Tasks Err:", error);
    res.status(500).json({ message: "Server Error fetching posted tasks" });
  }
};

// @desc    Get tasks accepted by the logged-in user
// @route   GET /api/tasks/my-accepted
// @access  Private
const getMyAcceptedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ acceptedBy: req.user._id })
      .populate("postedBy", "name") // Populate poster's name
      .sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get My Accepted Tasks Err:", error);
    res.status(500).json({ message: "Server Error fetching accepted tasks" });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:taskId
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("postedBy", "name email") // Populate full details for detail page
      .populate("acceptedBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Get Task By Id Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Task not found (invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error fetching task details" });
  }
};

// @desc    Accept a task
// @route   PUT /api/tasks/:taskId/accept
// @access  Private
const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      "postedBy",
      "name"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.status !== "Open")
      return res
        .status(400)
        .json({ message: "Task not available for acceptance" });
    if (task.postedBy._id.toString() === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You cannot accept your own task" });

    task.acceptedBy = req.user._id;
    task.status = "InProgress";
    const updatedTask = await task.save();

    // Notification
    const notificationMsg = `${req.user.name} accepted your task: "${
      task.title || "Untitled Task"
    }"`;
    const notification = await Notification.create({
      userId: task.postedBy._id,
      message: notificationMsg,
      taskId: task._id,
    });
    emitNotification(task.postedBy._id.toString(), notification);

    res.json(updatedTask);
  } catch (error) {
    console.error("Accept Task Err:", error);
    res.status(500).json({ message: "Server Error accepting task" });
  }
};

// @desc    Mark a task as completed
// @route   PUT /api/tasks/:taskId/complete
// @access  Private (Only Poster)
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      "acceptedBy",
      "name"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.postedBy.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Not authorized to complete this task" });
    if (task.status !== "InProgress")
      return res.status(400).json({ message: "Task is not In Progress" });

    task.status = "Completed";
    task.completedAt = Date.now();
    const updatedTask = await task.save();

    // Notification
    if (task.acceptedBy) {
      const notificationMsg = `Your task "${
        task.title || "Untitled Task"
      }" has been marked as completed.`;
      const notification = await Notification.create({
        userId: task.acceptedBy._id,
        message: notificationMsg,
        taskId: task._id,
      });
      emitNotification(task.acceptedBy._id.toString(), notification);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Complete Task Err:", error);
    res.status(500).json({ message: "Server Error completing task" });
  }
};

// --- Move module.exports to the VERY END ---
module.exports = {
  createTask,
  getOpenTasks,
  getMyPostedTasks,
  getMyAcceptedTasks,
  getTaskById,
  acceptTask,
  completeTask,
};
