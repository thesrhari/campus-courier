const express = require("express");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io"); // Socket.IO server class
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { initializeSocket } = require("./socket/socketHandlers"); // Import socket initializer

dotenv.config(); // Load .env variables

connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON requests

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Simple route for testing server is up
app.get("/", (req, res) => {
  res.send("Campus Courier API Running");
});

// --- Socket.IO Setup ---
const server = http.createServer(app); // Create HTTP server from Express app

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend origin
    methods: ["GET", "POST"],
    // credentials: true // If you need cookies/auth headers
  },
});

initializeSocket(io); // Initialize Socket.IO event handlers
// --- End Socket.IO Setup ---

const PORT = process.env.PORT || 5001;

// Use the HTTP server (which includes Express app) to listen
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
