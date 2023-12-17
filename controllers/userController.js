const asyncHandler = require("express-async-handler");
const sendEmailController = require("./emailController");
const uniqueid = require("uniqid");
const validateMongoDbId = require("../utils/validateMongoDbId");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { generateToken } = require("../config/jwtToken");

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
  console.log("findUser in login fn", findUser);
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // findUser ke andr isPasswordMatched kaise aa rha hai
    delete findUser.password;
    res.json({
      result: "Logged in successfully",
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
  console.log("findAdmin in loginAdmin fn", findAdmin);
  console.log("findAdmin.role in loginAdmin fn", findAdmin.role);
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
  console.log("req in updatePassword fn", req);
  console.log("req.body in updatePassword fn", req.body);

  const { _id } = req.user;
  const { password } = req.body;
  const user = await User.findById(_id);
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
    throw new Error("User does not exist with");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi. Please follow this link to reset Your Password. This link will be valid for 10 minutes. <a 
    href='http://localhost:4000/api/user/reset-password/${token}/'>Click here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmailController(data);
    res.json(token);
  } catch (err) {
    {
      res.json({
        success: false,
        message: err.message,
      });
    }
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  console.log("hey");
  console.log("req.user in getWishlist fn", req.user);
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

// save a address
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
    console.log("user in addToUserCart fn", user);
    // check if user already have products in the cart
    const alreadyExistCart = await Cart.findOneAndDelete({ orderBy: user._id });
    console.log("alreadyExistCart in userCart fn", alreadyExistCart);
    // if (alreadyExistCart) {
    //   await alreadyExistCart.remove();
    // }

    console.log("cart just before for loop in userCart", cart);
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      console.log("cart[i]._id", cart[i]._id);
      object.count = cart[i].count;
      console.log("cart[i].count", cart[i].count);
      object.color = cart[i].color;
      console.log("cart[i].color", cart[i].color);
      let getPrice = await Product.findById(cart[i]._id).select("price").exec(); // agr mai .select("price") ye na likhu to fir uss product ki
      // sari fields getPrice me aa jayengi aur ye(.select("price").exec()) likhne se sirf uss product ki id aur price field hi ayengi getPrice me
      console.log("getPrice", getPrice);
      object.price = getPrice.price;
      console.log("getPrice.price", getPrice.price);
      console.log("object", object);
      products.push(object);
    }
    console.log("products after for loop in userCart fn", products);
    const add = await User.findOneAndUpdate(
      _id,
      {
        cart: products,
      },
      { new: true }
    );

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      console.log("products[i].price", products[i].price);
      console.log("products[i].count", products[i].count);
      cartTotal = cartTotal + products[i].price * products[i].count;
      console.log("cartTotal", cartTotal);
    }
    console.log("cartTotal after for loop in userCart fn", cartTotal);

    let newCart = await new Cart({
      products, // ek chij try krna ki koi aur name dekr check krna hai kya cart me vhi chij add ho rhi hai
      cartTotal,
      orderBy: user._id,
    }).save();
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

// ye fn jo user login krega uski cart ki details layega kuki user login se uss user ki id se cart find kr rhe
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
    const removedCart = await Cart.findOneAndDelete({ orderBy: _id }); // ye sirf ek line likhne se bhi delete ho rha tha joki maine kiya hai
    // to ye niche do lines nhi likhni pdti
    // const user = await User.findOne({ _id });
    // const removedCart = await Cart.findOneAndRemove({ orderBy: user._id });
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
  console.log("validCoupon in applyCoupon fn", validCoupon);
  if (!validCoupon) {
    throw new Error("Invalid Coupon");
  }
  console.log("validCoupon in emptyCart fn", validCoupon);
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
    console.log("1");
    if (couponApplied && userCart?.totalAfterDiscount) {
      console.log("2");
      finalAmount = userCart.totalAfterDiscount;
      console.log("if block finalAmount in userCart fn", finalAmount);
    } else {
      console.log("3");
      finalAmount = userCart?.cartTotal;
      console.log("else block finalAmount in userCart fn", finalAmount);
    }
    console.log("4");

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
  updateUser,
  getAllUser,
  getUserById,
  deleteUser,
  updatePassword,
  forgotPasswordToken,
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
