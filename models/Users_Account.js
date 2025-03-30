const mongoose = require("mongoose");

const userAccountSchema = new mongoose.Schema({
  account_name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const UserAccount = mongoose.model("user_accounts", userAccountSchema);

module.exports = UserAccount;
