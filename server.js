const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ======================
  // JOIN PRIVATE CHAT
  // ======================
  socket.on("joinChat", async (d) => {
    const parsed = typeof d === "string" ? JSON.parse(d) : d;
    const users = parsed?.users;
    
    const res = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.join_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });

    const data = await res.json();
    
    const chatId = data.chat_id;

    socket.join(chatId);
    socket.emit("chatJoined", { chatId });

    const msgRes = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.get_messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
    });

    const msgData = await msgRes.json();

    (msgData.message?.messages || msgData.messages).forEach((m) => {
      socket.emit("OneByOnemessage", m);
    });
  });

  // ======================
  // JOIN GROUP
  // ======================
  socket.on("joinGroup", async (d) => {
    const parsed = typeof d === "string" ? JSON.parse(d) : d;
    const users = parsed?.users;
    const subject = parsed?.subject;
    const res = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.join_group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users, subject }),
    });

    const data = await res.json();
    const chatId = data.chat_id;

    socket.join(chatId);
    socket.emit("groupJoined", { chatId });

    const msgRes = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.get_messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
    });

    const msgData = await msgRes.json();
    

    (msgData.message?.messages || msgData.messages).forEach((m) => {
      socket.emit("Groupmessages", m);
    });
  });

  // ======================
  // SEND PRIVATE MESSAGE
  // ======================
  socket.on("Sendmessage", async (msg) => {
    const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
    const message = parsed?.message;
    const sourceId = parsed?.sourceId;
    const targetId = parsed?.targetId;
    const chatId = parsed?.chatId;
    const isImage = parsed?.isImage;
    const isVoice = parsed?.isVoice;
    const isPDF = parsed?.isPDF;


  const res = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.send_message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body :JSON.stringify({ message, sourceId, targetId, chatId, isImage, isVoice, isPDF }),
  });

  const data = await res.json();

  io.to(msg.chatId).emit("OneByOnemessage", data.message);
});

  // ======================
  // SEND GROUP MESSAGE
  // ======================
  socket.on("SendGroupmessage", async (msg) => {
    const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
    const message = parsed?.message;
    const sourceId = parsed?.sourceId;
    const chatId = parsed?.chatId;
    const isImage = parsed?.isImage;
    const isVoice = parsed?.isVoice;
    const isPDF = parsed?.isPDF;
    const res = await fetch("http://floreo.localhost:8001/api/method/floreo.api.student_app.chat.send_group_message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sourceId, chatId, isImage, isVoice, isPDF }),
    });

    const data = await res.json();

    io.to(msg.chatId).emit("Groupmessages", data.message);
  });
});

server.listen(5000, "0.0.0.0", () => console.log("Server running"));