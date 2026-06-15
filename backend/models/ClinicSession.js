const mongoose = require("mongoose");

const clinicSessionSchema =
new mongoose.Schema({

  visitDate: String,

  dayName: String,

  status: {
    type: String,
    default: "OPEN"
  }

});

module.exports =
mongoose.model(
  "ClinicSession",
  clinicSessionSchema
);