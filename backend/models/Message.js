const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }, // Denormalized for easier querying if needed
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: "timestamp" } }
); // Use timestamp field name

MessageSchema.index({ taskId: 1, timestamp: 1 });

module.exports = mongoose.model("Message", MessageSchema);
