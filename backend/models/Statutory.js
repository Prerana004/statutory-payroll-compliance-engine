const mongoose = require("mongoose");

const statutorySchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    pfPercentage: {
      type: Number,
      required: true,
    },
    esiPercentage: {
      type: Number,
      required: true,
    },
    professionalTax: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statutory", statutorySchema);
