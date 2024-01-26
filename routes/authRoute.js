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
router.get("/getWishlist", authMiddleware, getWishlist); // isko niche krne pe error aa rha
router.get("/getUserCart", authMiddleware, getUserCart); // isko niche likhne pe error aa rha you are not an admin but iss route ko upr laya to
// mujhe cart dikh rha
router.delete("/emptyCart", authMiddleware, emptyCart); // // isko niche likhne pe error aa rha saying ->
// "CastError: Cast to ObjectId failed for value \"emptyCart\" (type string) at path \"_id\" for model \"User\"" but iss route ko upr laya to mujhe
// cart dikh rha
router.get("/getOrders", authMiddleware, getOrders); // ye bhi niche nhi chl rha error saying you are not an admin
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.delete("/:id", deleteUser);
router.put("/password", authMiddleware, updatePassword); // Because of middleware we are getting req.user and bcz of req.user we are getting id in
// updatePassword function which is inside userController
// ek warri ye check krna hai yha se middleware remove krke ki req.user me kya aa rha hai joki updatePassword controller me hai aur fir yha pe
// lgana hai
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

// adddress nhi aa rha adrees wala dekhna hai
