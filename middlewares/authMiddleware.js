const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // console.log("process.env.JWT_SECRET inside authMiddleware", process.env.JWT_SECRET);
    // console.log("token inside authMiddleware", token);
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("decoded in authMiddleware", decoded);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (err) {
      throw new Error("Not authorized token expired, Please Login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  console.log("req.user in isAdmin", req.user);
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };

// const obj = {
//   age: 25,
//   profession: "Software developer",
// }
// obj.name = "Anshuman";
// console.log(obj);
// Output->
// -> (3) {age: 25, profession: "Software deve...}
//    age: 25
//    profession: "Software developer"
//    name: "Anshuman"
//    >[[Prototype]]: {}
// That is how we assigned the req.user
