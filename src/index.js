import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import Filter from "bad-words";
import { fileURLToPath } from "url";

import { generateMessage, generateLocationMessage } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/user.js";

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log("New WebSocket connection established");

  // User joins a room
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return callback(error);

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome to ByteChat!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // User sends a message
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (!user) return callback("You are not authenticated");

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  // User sends location
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    if (!user) return callback("You are not authenticated");

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );

    callback();
  });

  // User disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});