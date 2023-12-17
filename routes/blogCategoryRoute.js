const express = require("express");
const {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategoryById,
  getAllBlogCategory,
} = require("../controllers/blogCategoryController");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/createBlogCategory", authMiddleware, isAdmin, createBlogCategory);

router.put(
  "/updateBlogCategory/:id",
  authMiddleware,
  isAdmin,
  updateBlogCategory
);

router.delete(
  "/deleteBlogCategory/:id",
  authMiddleware,
  isAdmin,
  deleteBlogCategory
);

router.get("/getBlogCategoryById/:id", getBlogCategoryById);

router.get("/getAllBlogCategory", getAllBlogCategory);

module.exports = router;
