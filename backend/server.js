require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins dynamically to support local development and all Vercel deployments
      callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json());

app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
    res.send("Queue Cure Backend Running");
});

const PORT = process.env.PORT || 5000;

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {

  console.log(
    "Client Connected:",
    socket.id
  );

});

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});