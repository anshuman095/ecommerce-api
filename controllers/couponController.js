const asyncHandler = require("express-async-handler");
const Coupon = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const allCoupon = await Coupon.find();
    res.json(allCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    res.json(deletedCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = { createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
