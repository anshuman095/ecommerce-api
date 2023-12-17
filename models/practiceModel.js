const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var practiceSchema = new mongoose.Schema({
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
});

//Export the model
module.exports = mongoose.model("Practice", practiceSchema);
