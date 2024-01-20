const asyncHandler = require("express-async-handler");
const sendEmailController = require("./emailController");
const uniqueid = require("uniqid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validateMongoDbId = require("../utils/validateMongoDbId");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");

const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      throw new Error("User alrady exists");
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = generateRefreshToken(findUser._id);
    console.log("refreshToken", refreshToken);
    console.log("findUser._id", findUser._id);
    const user = await User.findByIdAndUpdate(
      findUser._id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshTokeen", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      result: "Logged in successfully",
      data: user,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (!findAdmin) {
    throw new Error("User not found");
  }
  if (findAdmin.role !== "admin") {
    throw new Error("Not Authorized");
  }
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    delete findAdmin.password;
    res.json({
      result: "Logged in successfully",
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log("cookie", cookie);
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("No refresh token present in db or not matched");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const logOut = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    return res.status(204);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  res.status(204);
});

const updateUser = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  const { _id } = req.user;

  const user = await User.findById(_id);
  if (!user) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }
  Object.assign(user, req.body);
  const updatedUser = await user.save();

  res.json(updatedUser);
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getAllUsers = await User.find();
    res.json(getAllUsers);
  } catch (err) {
    throw new Error(err);
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (err) {
    throw new Error(err);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { current_password, new_password, confirm_new_password } = req.body;
  const salt = bcrypt.genSalt(10);
  const hashedPassword = bcrypt.hash(current_password, salt);
  const user = await User.findById(_id);
  if (user) {
    const passwordMatch = await user.isPasswordMatched(hashedPassword);
    if (passwordMatch) {
      if (new_password === confirm_new_password) {
        const salt = bcrypt.genSalt(10);
        let new_generated_password = await bcrypt.hash(new_password, salt);
        await User.findByIdAndUpdate(
          user._id,
          { password: new_generated_password },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "Password update successfully",
        });
      } else {
        throw new Error("New Password And Current Password does not match");
      }
    } else {
      throw new Error("Current password is not correct");
    }
  } else {
    throw new Error("User does not exist");
  }
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }
  try {
    const token = await user.createPasswordResetToken(email);
    await User.findOneAndUpdate(
      { email },
      { passwordResetToken: token },
      { new: true }
    );
    const resetURL = `Hi. Please follow this link to reset Your Password. This link will be valid for 10 minutes. <a 
    href='http://localhost:4000/api/user/reset-password/${token}/'>Click here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmailController(data);
    res.status(200).json({ message: "Password reset mail sent" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  const user = await User.findOne({ passwordResetToken: token });
  if (user) {
    const { email } = await user.verifyPasswordResetToken(token);
    const userExist = await User.findOne({ email });
    if (userExist) {
      if (newPassword === confirmPassword) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findOneAndUpdate(
          { email },
          {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
          },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "Password successfully updated",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "New password and confirm password don't match",
        });
      }
    }
  } else {
    res.status(404).json({
      message: "Invalid or expired token",
    });
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateAddress = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updateAddress);
  } catch (err) {
    throw new Error(err);
  }
});

const addToUserCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOneAndDelete({ orderBy: user._id });
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    await User.findOneAndUpdate(
      _id,
      {
        cart: products,
      },
      { new: true }
    );

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user._id,
    }).save();
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const removedCart = await Cart.findOneAndDelete({ orderBy: _id });
    await User.findByIdAndUpdate(_id, { cart: [] }, { new: true });
    res.json(removedCart);
  } catch (err) {
    throw new Error(err);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  const { cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");

  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    {
      totalAfterDiscount,
    },
    { new: true }
  );
  res.json({
    finalAmountToPayAfterCoupon: totalAfterDiscount,
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) {
      throw new Order("Create Cash failed");
    }
    const user = await User.findById(_id);
    console.log("user in createOrder fn", user);
    let userCart = await Cart.findOne({ orderBy: user._id });
    console.log("userCart in createOrder fn", userCart);

    if (!userCart) {
      throw new Error("Cart is empty");
    }

    let finalAmount = 0;
    if (couponApplied && userCart?.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
      console.log("if block finalAmount in userCart fn", finalAmount);
    } else {
      finalAmount = userCart?.cartTotal;
      console.log("else block finalAmount in userCart fn", finalAmount);
    }

    await new Order({
      products: userCart?.products,
      paymentIntent: {
        id: uniqueid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash On Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderBy: user._id,
      orderStatus: "Cash On Delivery",
    }).save();

    console.log("userCart.products in createOrder fn", userCart.products);
    let update = userCart.products.map((item) => {
      const productId = item.product._id;
      const quantityToDecrease = -item.count;
      const soldToIncrease = +item.count;

      console.log(`Updating product with ID ${productId}`);
      console.log(`  Quantity to decrease: ${quantityToDecrease}`);
      console.log(`  Sold to increase: ${soldToIncrease}`);

      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
          // decrease the amount of quantity of prroduct and need to increase the sold quantity
        },
      };
    });
    console.log("update in createOrder fn", update);

    await Product.bulkWrite(update, {});

    res.json({
      message: "success",
    });
  } catch (err) {
    throw new Error(err);
  }
});

// Those orders will be visible to the user who is login because we are finding on the basis of user id
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.findOne({ orderBy: _id }).populate(
      "products.product"
    );
    res.json(userOrders);
  } catch (err) {
    throw new Error(err);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }
    const { paymentIntent } = existingOrder;
    console.log("paymentIntent in updateOrderStatus function", paymentIntent);
    const updateOrderStats = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          ...paymentIntent,
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStats);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createUser,
  loginUser,
  loginAdmin,
  handleRefreshToken,
  logOut,
  updateUser,
  getAllUser,
  getUserById,
  deleteUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  saveAddress,
  addToUserCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
};
