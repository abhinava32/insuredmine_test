const mongoose = require("mongoose");

const User_Schema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    isMail: true,
  },

  gender: {
    type: String,
    required: true,
  },

  userType: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
  },
  agentId: {
    type: mongoose.Types.ObjectId,
    ref: "agents",
    required: true,
  },
});

const User = mongoose.model("users", User_Schema);

module.exports = User;
