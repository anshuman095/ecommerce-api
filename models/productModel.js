const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      //   type: mongoose.Schema.Types.ObjectId,
      // ref: "Category",
      type: String,
      required: true,
    },
    brand: {
      type: String,
      //   enum: ["Apple", "Samsung", "Lenevo"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
      // select: false, // By doing so user will not be able to see this sold field
    },
    // images: {
    //   type: Array,
    // },
    images: [],
    color: {
      type: String,
      //   enum: ["Black", "Brown", "Green"],
      required: true,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalRating: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
