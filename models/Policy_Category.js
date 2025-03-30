const mongoose = require("mongoose");

const policyCategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
});

const PolicyCategory = mongoose.model("policy_category", policyCategorySchema);

module.exports = PolicyCategory;
