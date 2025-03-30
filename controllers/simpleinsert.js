const Agent = require("../models/Agent");

const insert = async () => {
  const newAgent = await new Agent({
    Agent_Name: "Agent 1",
  });
  await newAgent.save();
};

module.exports = { insert };
