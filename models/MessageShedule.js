const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Validate time format (HH:mm)
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid time format! Use HH:mm`,
    },
  },
  status: {
    type: String,
    enum: ["pending", "sent"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchedule = mongoose.model("Message", messageSchema);
module.exports = messageSchedule;
