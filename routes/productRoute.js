const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createProduct,
  getAllProducts,
  getAllProductss,
  getAllProducts1,
  getAllProductsByQuery,
  getAllProductsByQuery1,
  getProductById,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadProductImages,
} = require("../controllers/productController");
const {
  uploadPhoto,
  productImageResize,
} = require("../middlewares/uploadImages");

router.post("/createProduct", authMiddleware, isAdmin, createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getAllProductss", getAllProductss);
router.get("/getAllProducts1", getAllProducts1);
router.get("/getAllProductsByQuery", getAllProductsByQuery);
router.get("/getAllProductsByQuery1", getAllProductsByQuery1);
router.get("/:id", getProductById);
router.put("/update/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.put(
  "/upload-images/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImageResize,
  uploadProductImages
);

module.exports = router;
