const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const category = await Brand.create(req.body);
    res.json(category);
  } catch (err) {
    throw new Error(err);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await Brand.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (err) {
    throw new Error(err);
  }
});

const getBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const brand = await Brand.findById(id);
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const allBrand = await Brand.find();
    res.json(allBrand);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  getAllBrand,
};
