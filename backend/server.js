require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");

const app = express();

connectDB();

app.use(cors());
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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
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