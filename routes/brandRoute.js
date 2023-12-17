const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  getAllBrand,
} = require("../controllers/brandController");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/createBrand", authMiddleware, isAdmin, createBrand);

router.put("/updateBrand/:id", authMiddleware, isAdmin, updateBrand);

router.delete("/deleteBrand/:id", authMiddleware, isAdmin, deleteBrand);

router.get("/getBrandById/:id", getBrandById);

router.get("/getAllBrand", getAllBrand);

module.exports = router;
