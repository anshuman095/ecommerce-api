const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadBlogImages,
} = require("../controllers/blogController");
const { blogImageResize, uploadPhoto } = require("../middlewares/uploadImages");

router.post("/create", authMiddleware, isAdmin, createBlog);
router.put("/update-blog/:id", authMiddleware, isAdmin, updateBlog);
router.get("/get-blog/:id", getBlog);
router.get("/get-all-blogs", getAllBlogs);
router.delete("/delete-blog/:id", authMiddleware, isAdmin, deleteBlog);
router.put("/likes", authMiddleware, likeBlog);
router.put("/dislikes", authMiddleware, dislikeBlog);
router.put(
  "/uploadBlogImage/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImageResize,
  uploadBlogImages
);

module.exports = router;
