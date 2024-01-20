const mongoose = require("mongoose");

var practiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    image: [],
    video: [],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Practice", practiceSchema);
