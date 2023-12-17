const ProductCategory = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createProductCategory = asyncHandler(async (req, res) => {
  try {
    const category = await ProductCategory.create(req.body);
    res.json(category);
  } catch (err) {
    throw new Error(err);
  }
});

const updateProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await ProductCategory.findByIdAndUpdate(
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

const deleteProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await ProductCategory.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const getProductCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const productCategory = await ProductCategory.findById(id);
    res.json(productCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllProductCategory = asyncHandler(async (req, res) => {
  try {
    const allProductCategory = await ProductCategory.find();
    res.json(allProductCategory);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  getAllProductCategory,
};
