const mongoose = require("mongoose");

const policyCarrierSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
});

const policyCarrier = mongoose.model("policy_carrier", policyCarrierSchema);
module.exports = policyCarrier;
