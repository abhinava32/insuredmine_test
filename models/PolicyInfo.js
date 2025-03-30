const mongoose = require("mongoose");
const policyCarrier = require("./Policy_Carrier");

const policyInfoSchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  policyStartDate: {
    type: Date,
    required: true,
  },
  policyEndDate: {
    type: Date,
    required: true,
  },
  policyMode: {
    type: String,
    required: true,
  },
  policyType: {
    type: String,
    required: true,
  },
  premiumAmountWritten: {
    type: Number,
  },
  premiumAmount: {
    type: Number,
    required: true,
  },
  policyCategoryId: {
    type: mongoose.Types.ObjectId,
    ref: "policy_category",
    required: true,
  },
  policyCarrierId: {
    type: mongoose.Types.ObjectId,
    ref: "policy_carrier",
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  csr: {
    type: String,
    required: true,
  },
  hasActiveClientPolicy: {
    type: Boolean,
    required: true,
  },
});

const PolicyInfo = mongoose.model("policy_info", policyInfoSchema);

module.exports = PolicyInfo;
