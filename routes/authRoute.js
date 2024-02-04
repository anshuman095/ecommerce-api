const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  loginAdmin,
  handleRefreshToken,
  logOut,
  getAllUser,
  getUserById,
  deleteUser,
  updateUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  saveAddress,
  addToUserCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  removeCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/loginAdmin", loginAdmin);
router.get("/handleRefreshToken", handleRefreshToken);
router.get("/logout", logOut);
router.put("/update/edit-user", authMiddleware, updateUser);
router.get("/allUser", getAllUser);
router.get("/getWishlist", authMiddleware, getWishlist);
router.get("/getUserCart", authMiddleware, getUserCart);
router.delete("/emptyCart", authMiddleware, emptyCart);
router.get("/getOrders", authMiddleware, getOrders);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.delete("/:id", deleteUser);
router.put("/password", authMiddleware, updatePassword);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.put("/saveAddress", authMiddleware, saveAddress);
router.post("/cart", authMiddleware, addToUserCart);
router.post("/cart/applyCoupon", authMiddleware, applyCoupon);
router.post("/cart/removeCoupon", authMiddleware, removeCoupon);
router.post("/cart/cashOrder", authMiddleware, createOrder);
router.put(
  "/order/updateOrderStatus/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

module.exports = router;
