const PolicyInfo = require("../models/PolicyInfo");

const getPoliciesByUser = async (req, res) => {
  try {
    const aggregatedPolicies = await PolicyInfo.aggregate([
      {
        $lookup: {
          from: "users", // collection name for users
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $group: {
          _id: "$userId",
          userInfo: { $first: "$userDetails" },
          totalPolicies: { $sum: 1 },
          policies: { $push: "$$ROOT" },
          totalPremiumAmount: { $sum: "$premiumAmount" },
        },
      },
      {
        $project: {
          _id: 1,
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
          "userInfo.email": 1,
          totalPolicies: 1,
          totalPremiumAmount: 1,
          policies: {
            policyNumber: 1,
            policyType: 1,
            premiumAmount: 1,
            policyStartDate: 1,
            policyEndDate: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Successfully retrieved policies by user",
      data: aggregatedPolicies,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error processing request",
      error: error.message,
    });
  }
};

module.exports = {
  getPoliciesByUser,
};
