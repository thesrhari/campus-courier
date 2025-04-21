// backend/models/Task.js
const mongoose = require("mongoose");

const StationeryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Pen", "A4 Notebook", "Pencil"
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
); // Don't create separate IDs for sub-items

const TaskSchema = new mongoose.Schema(
  {
    // Core Fields
    title: { type: String, required: false, index: true }, // Made optional, can be auto-generated
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Open", "InProgress", "Completed"],
      default: "Open",
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    deliveryLocation: { type: String, required: true }, // Delivery is required
    deadline: { type: Date },
    completedAt: { type: Date, default: null },

    // --- Category and Details ---
    category: {
      type: String,
      required: true,
      enum: ["Stationery", "Printouts"], // Add more categories later
      index: true,
    },
    stationeryDetails: {
      // Only present if category is 'Stationery'
      items: [StationeryItemSchema],
      additionalInfo: { type: String },
    },
    printoutDetails: {
      // Only present if category is 'Printouts'
      // In a real app, fileUrl would come from cloud storage after upload
      fileUrl: { type: String }, // Store the URL (SIMULATED FOR NOW)
      fileName: { type: String },
      fileType: { type: String }, // e.g., 'application/pdf'
      pages: { type: Number },
      color: { type: Boolean, default: false }, // Default to black & white
      doubleSided: { type: Boolean, default: false },
      additionalInfo: { type: String },
    },
    // REMOVED: description (replaced by additionalInfo in details)
    // REMOVED: pickupLocation
  },
  { timestamps: true }
);

// Auto-generate title before saving if not provided
TaskSchema.pre("save", function (next) {
  if (!this.title) {
    if (this.category === "Stationery") {
      this.title = `Stationery Request (${
        this.stationeryDetails?.items?.length || 0
      } items)`;
    } else if (
      this.category === "Printouts" &&
      this.printoutDetails?.fileName
    ) {
      this.title = `Print Request: ${this.printoutDetails.fileName}`;
    } else {
      this.title = `${this.category} Request`; // Generic fallback
    }
  }
  next();
});

module.exports = mongoose.model("Task", TaskSchema);
