const mongoose = require("mongoose");

const Agent_Schema = new mongoose.Schema({
  Agent_Name: {
    type: String,
    required: true,
  },
});

const Agent = mongoose.model("agents", Agent_Schema);

module.exports = Agent;
