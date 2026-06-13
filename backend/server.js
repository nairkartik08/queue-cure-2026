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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});