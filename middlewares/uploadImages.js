const multer = require("multer");
const sharp = require("sharp");
const path = require("path"); // We are going to first store or images in our local after that we will upload to the cloud
const fs = require("fs");

const multerStorage = multer.diskStorage({
  // It will store the files in our local after that we will upload it to our cloudinary
  destination: function (req, file, cb) {
    // cb is a callback
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

const productImageResize = async (req, res, next) => {
  console.log('req.files in productImageResize fn', req.files);
  if (!req.files) {
    return next();
  }
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
      fs.unlinkSync(`public/images/products/${file.filename}`);
    })
  );
  next();
};

const blogImageResize = async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};

module.exports = { uploadPhoto, productImageResize, blogImageResize };

// npm i multer sharp cloudinary
// multer is used to handle our multi-part form data
// Sharp-> sharp is used to like we can modify our images without like for example like we can change the dimensions and we can change the image format
// and we can change our quality with the help of sharp
// Cloudinary-> Cloudinary is a images and video management tool
