import express from "express";
import http from "http";
import { Server as socketIo } from "socket.io";
import cors from "cors";

// Initialize Express and HTTP Server
const app = express();
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Correct origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Match frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Basic Route
app.get("/", (req, res) => {
  res.send("Chat app backend is running");
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for incoming messages
  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);

    // Broadcast message to other clients
    socket.broadcast.emit("receiveMessage", message);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
