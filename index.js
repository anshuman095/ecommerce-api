const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");
const blogCategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
const practiceRouter = require("./routes/practiceRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan");

dbConnect();

app.use(morgan("dev"));
app.use(
  express.json({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/productCategory", productCategoryRouter);
app.use("/api/blogCategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/practice", practiceRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
