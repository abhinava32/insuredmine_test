const PolicyInfo = require("../models/PolicyInfo");
const User = require("../models/User");

const search = async (req, res) => {
  try {
    const name = req.params.name;
    // First find the user
    const user = await User.findOne({ firstName: name });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Then find policy using the user's ID
    const policy_info = await PolicyInfo.find({ userId: user._id });

    if (!policy_info) {
      return res.status(200).json({
        message: "No policy found",
      });
    }

    return res.status(200).json({
      message: "Processed info successfully",
      data: {
        policy_info,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error processing request",
      error: error.message,
    });
  }
};

module.exports = {
  search,
};
