const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
  currentToken: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("Queue", queueSchema);