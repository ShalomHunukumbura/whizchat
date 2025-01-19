import express from "express";
import http from "http";
import { Server as socketIo } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

// Connect to MongoDB
const mongoURI = "mongodb://127.0.0.1:27017/whizChat"
if (!mongoURI) {
  throw new Error("MONGO_URI environment variable is not defined");
}
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Message Schema
const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// Initialize Express and HTTP Server
const app = express();
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
}));

// Fetch all messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Server error");
  }
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("userConnected", (userData) => {
    console.log(`User logged in: ${userData.name} (${userData.email})`);
  });

  socket.on("sendMessage", async (messageData) => {
    console.log(`Message from ${messageData.user}: ${messageData.text}`);
    
    // Save message to database
    const newMessage = new Message({
      user: messageData.user,
      text: messageData.text,
      timestamp: messageData.timestamp,
    });

    await newMessage.save();

    // Broadcast message to other clients
    socket.broadcast.emit("receiveMessage", messageData);
  });

  //typing event: user is typing
  socket.on("typing", (username) => {
    socket.broadcast.emit("userTyping", username) //broadcast typing to other clients
  })

  //stop typing event: user stopped typing
  socket.on("stopTyping", (username) => {
    socket.broadcast.emit("userStoppedTyping", username) // boradcast stop typing to other users
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
