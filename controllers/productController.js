const Product = require("../models/productModel");
const slugify = require("slugify");
const fs = require("fs");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const cloudinaryUploadImage = require("../utils/cloudinary");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req?.body?.title) {
      req.body.slug = slugify(req.body.title);
    }
    const createdProduct = await Product.create(req.body);
    res.json(createdProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"]; // ye smjhna hai abi
    excludeFields.forEach((el) => delete queryObj[el]); // ye smjhna hai abi
    console.log(
      "req.query in getAllProducts",
      req.query,
      "-----------",
      "queryObj in getAllProducts",
      queryObj
    );
    // Output req.query in getAllProducts { category: 'Phone', sort: 'price' } ----------- queryObj in getAllProducts { category: 'Phone' }
    // const getAllProducts = await Product.find();
    let queryStr = JSON.stringify(queryObj);
    console.log("queryStr in getAllProducts", queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // ye smjhna hai abi
    console.log("queryStr after parse", JSON.parse(queryStr));
    // const getAllProducts = await Product.find(queryObj);
    // let query = await Product.find(JSON.parse(queryStr));
    const queryObjParsed = JSON.parse(queryStr);
    let query = Product.find(queryObjParsed);
    // http://localhost:4000/api/product/getAllProducts?price[gt]=500&price[lte]=1000

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" "); // ye smjhna hai abi  .split aur .join ke bina bhi kaam kr rha hai
      console.log("sortBy", sortBy);
      query = query.sort(sortBy); // yha pe basically me aise dunga query category brand
      // http://localhost:4000/api/product/getAllProducts?sort=category,brand
      // sara data aa jayega kuki sbhi me category brand hai line no.47 se
      // http://localhost:4000/api/product/getAllProducts?sort=-category
      // iss line se category descending order me ayegi aur ye line no.49 se aa rhi hai aur line no.49 wali query ka else wale part se koi mtlb
      // nhi hai agr else wala nhi likhe aur line no.49 wali query likhe fir bhi data descending order me hi ayega
      // http://localhost:4000/api/product/getAllProducts?sort=-category,-brand
      // 52 wali line se to data descending me ayega but phle category priority fir uss category ke andr brand ki descending order me sorting hogi
    }
    // else {
    //   query = query.sort("-createdAt"); // iss line se data jo sbse last me create hua hai vo sbse phle dikhega
    // }

    // limiting the fields
    // http://localhost:4000/api/product/getAllProducts?fields=title,price,category
    // line no.59 se sirf vhi fields dikhenge jo maine query me diya hai
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); // - krne se __v wali fields nhi dikhegi agr mai simple ye line no.66 execute krta hu postman se
      // http://localhost:4000/api/product/getAllProducts
      // http://localhost:4000/api/product/getAllProducts?fields=-title,-price,-category
      // agr 67 wali line execute krunga to fir title, price aur category field bhi output me nhi dikhenge
    }

    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    console.log(
      "page -->",
      page,
      "------",
      "limit -->",
      limit,
      "-----",
      "skip -->",
      skip
    );
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const allProductsCount = await Product.countDocuments();
      console.log(allProductsCount);
      if (skip >= allProductsCount) {
        throw new Error(`This page does not exists`);
      }
    }
    const product = await query;

    res.json(product);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
// ?fields=title,category

const getAllProductss = asyncHandler(async (req, res) => {
  try {
    var query = {
      price: {
        $gt: parseInt(req.query.price["gt"]),
        $lte: parseInt(req.query.price["lte"]),
      },
    };
    let product = await Product.find(query);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

const getAllProducts1 = asyncHandler(async (req, res) => {
  try {
    const getAllProducts = await Product.find();
    res.json(getAllProducts);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

const getAllProductsByQuery = asyncHandler(async (req, res) => {
  console.log("req.query in getAllProductsByQuery", req.query);
  try {
    const getAllProducts = await Product.find(req.query);
    res.json(getAllProducts);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

const getAllProductsByQuery1 = asyncHandler(async (req, res) => {
  console.log("req.query in getAllProductsByQuery1", req.query);
  try {
    const getAllProducts = await Product.find({
      brand: req.query.brand,
      category: req.query.category,
    });
    // const getAllProducts = await Product.where("category").equals(
    //   req.query.category
    // );
    res.json(getAllProducts);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Id in deleteProduct", id);
  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: id });
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(deletedProduct);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;
  try {
    const user = await User.findById(_id);
    console.log("user in addToWishlist fn", user);
    const alreadyAdded = user.wishlist.find((id) => {
      // id me vo id ayegi jo id mai postman ki body se send kr rha hu
      // in short userModel me wishlist ke andr jo hai vhi id me ayega
      console.log("id in find fn of addToWishlist", id); // ye console nhi aa rha jb koi id nhi hai mujhe ye smjhna hai agr id nhi hai fir bhi
      // atleast console me undefined aa jata but ye poora console nhi print hua phli baar jb koi id nhi hai aur agr ek id present hai to fir iss
      // console print ho rha
      return id.toString() === productId;
    });
    console.log("alreadyAdded outside if condition", alreadyAdded);
    if (alreadyAdded) {
      console.log("alreadyAdded in if condition", alreadyAdded);
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: productId },
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: productId },
        },
        { new: true }
      );
      res.json(user);
    }
  } catch (err) {
    throw new Error(err);
  }
});

// login user which I will get from req.user
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, productId } = req.body;
  try {
    const product = await Product.findById(productId);
    let alreadyRated = product.ratings.find((userId) => {
      // In userId we will get star and postedBy which is inside productModel ratings
      // in short ratings ke andr jo productModel me hai vhi userId me ayega
      console.log("userId in product.ratings.find", userId);
      return userId.postedBy.toString() === _id.toString();
    });
    console.log("alreadyRatd outside if condition", alreadyRated);
    if (alreadyRated) {
      console.log("alreadyRatd in if condition", alreadyRated);
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
      res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: { ratings: { star: star, comment: comment, postedBy: _id } },
        },
        { new: true }
      );
    }
    const getAllRatings = await Product.findById(productId);
    let totalRatings = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);

    let actualRating = Math.round(ratingSum / totalRatings);
    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      { totalRating: actualRating },
      { new: true }
    );
    res.json(finalProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductss,
  getAllProducts1,
  getAllProductsByQuery,
  getAllProductsByQuery1,
  getProductById,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadProductImages,
};
