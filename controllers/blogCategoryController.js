const BlogCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createBlogCategory = asyncHandler(async (req, res) => {
  try {
    const category = await BlogCategory.create(req.body);
    res.json(category);
  } catch (err) {
    throw new Error(err);
  }
});

const updateBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await BlogCategory.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const getBlogCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blogCategory = await BlogCategory.findById(id);
    res.json(blogCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllBlogCategory = asyncHandler(async (req, res) => {
  try {
    const allBlogCategory = await BlogCategory.find();
    res.json(allBlogCategory);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategoryById,
  getAllBlogCategory,
};
