const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path if needed
require("dotenv").config();

let ioInstance; // To store the io object globally within this module
const userSockets = new Map(); // Map userId -> socketId

function initializeSocket(io) {
  ioInstance = io; // Store io for later use in emit functions

  io.use(async (socket, next) => {
    // Optional: Authenticate socket connections using JWT
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("_id"); // Just need ID
        if (user) {
          socket.userId = user._id.toString(); // Attach userId to socket object
          next();
        } else {
          next(new Error("Authentication error: User not found"));
        }
      } catch (err) {
        console.error("Socket Auth Error:", err.message);
        next(new Error("Authentication error: Invalid token"));
      }
    } else {
      // Allow connection even without token for now,
      // but some features might require socket.userId
      console.warn("Socket connected without authentication token.");
      next();
      // Or reject: next(new Error('Authentication error: No token provided'));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      "A user connected:",
      socket.id,
      "User ID:",
      socket.userId || "Not Authenticated"
    );

    if (socket.userId) {
      userSockets.set(socket.userId, socket.id); // Store mapping
      console.log(`User ${socket.userId} mapped to socket ${socket.id}`);
    }

    // Join a room based on Task ID for messaging
    socket.on("joinTaskRoom", (taskId) => {
      if (taskId) {
        socket.join(taskId);
        console.log(`Socket ${socket.id} joined room for task ${taskId}`);
      }
    });

    // Leave a room when user navigates away (client should trigger this)
    socket.on("leaveTaskRoom", (taskId) => {
      if (taskId) {
        socket.leave(taskId);
        console.log(`Socket ${socket.id} left room for task ${taskId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(
        "User disconnected:",
        socket.id,
        "User ID:",
        socket.userId || "N/A"
      );
      if (socket.userId) {
        // Clean up mapping if the disconnected socket was the last one for the user
        if (userSockets.get(socket.userId) === socket.id) {
          userSockets.delete(socket.userId);
          console.log(`Removed mapping for user ${socket.userId}`);
        }
      }
    });
  });
}

// Function to emit a new message to a specific task room
function emitMessage(taskId, message) {
  if (ioInstance && taskId && message) {
    console.log(`Emitting newMessage to room ${taskId}:`, message);
    ioInstance.to(taskId).emit("newMessage", message);
  } else {
    console.error(
      "Failed to emit message: ioInstance or taskId/message missing"
    );
  }
}

// Function to emit a notification to a specific user
function emitNotification(userId, notification) {
  if (ioInstance && userId && notification) {
    const targetSocketId = userSockets.get(userId);
    if (targetSocketId) {
      console.log(
        `Emitting newNotification to user ${userId} (socket ${targetSocketId}):`,
        notification
      );
      ioInstance.to(targetSocketId).emit("newNotification", notification);
    } else {
      console.warn(
        `Could not emit notification: User ${userId} not connected or socket ID not found.`
      );
      // Potential fallback: Store in DB anyway, user will see on next load.
    }
  } else {
    console.error(
      "Failed to emit notification: ioInstance or userId/notification missing"
    );
  }
}

module.exports = {
  initializeSocket,
  emitMessage,
  emitNotification,
};
