const express = require("express");
const {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  getAllProductCategory,
} = require("../controllers/productCategoryController");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post(
  "/createProductCategory",
  authMiddleware,
  isAdmin,
  createProductCategory
);

router.put(
  "/updateProductCategory/:id",
  authMiddleware,
  isAdmin,
  updateProductCategory
);

router.delete(
  "/deleteProductCategory/:id",
  authMiddleware,
  isAdmin,
  deleteProductCategory
);

router.get("/getProductCategoryById/:id", getProductCategoryById);

router.get("/getAllProductCategory", getAllProductCategory);

module.exports = router;
