const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");
const cloudinaryUploadImage = require("../utils/cloudinary");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      status: "success",
      result: newBlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedViews = await Blog.findByIdAndUpdate(
      id,
      { $inc: { numOfViews: 1 } },
      {
        new: true,
      }
    )
      .populate("likes")
      .populate("disLikes");
    res.json(updatedViews);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const allBlogs = await Blog.find();
    res.json(allBlogs);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    res.json(deletedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  const blog = await Blog.findById(blogId);
  const loginUserId = req?.user?._id;
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  //   const alreadyDisliked = blog?.dislikes?.find((userId) => {
  //     userId?.toString() === loginUserId?.toString();
  //   });
  //   if (alreadyDisliked) {
  //     const blog = await Blog.findByIdAndUpdate(
  //       blogId,
  //       {
  //         $pull: { dislikes: loginUserId },
  //         isDisliked: false,
  //       },
  //       { new: true }
  //     );
  //     res.json(blog);
  //   }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  const loginUserId = req?.user?._id;
  const isDisLiked = blog?.isDisliked;
  //   const alreadyLiked = blog?.likes?.find(
  //     (userId) => userId?.toString() === loginUserId?.toString()
  //   );
  //   if (alreadyLiked) {
  //     const blog = await Blog.findByIdAndUpdate(
  //       blogId,
  //       {
  //         $pull: { likes: loginUserId },
  //         isLiked: false,
  //       },
  //       { new: true }
  //     );
  //     res.json(blog);
  //   }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

const uploadBlogImages = asyncHandler(async (req, res) => {
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
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findBlog);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadBlogImages,
};

// const likeBlog = asyncHandler(async (req, res) => {
//     try {
//       const { blogId } = req.body;
//       const blog = await Blog.findById(blogId);
//       const loginUserId = req.user._id;
//       if (blog.isLiked === false) {
//         blog.isLiked = true;
//         blog.likes.push(loginUserId);
//         await blog.save();
//       } else if (blog.isLiked === true) {
//         blog.isLiked = false;
//         blog.likes.filter((id) => {
//           id.toString() !== loginUserId.toString();
//         });
//         await blog.save();
//       }
//       res.json(blog);
//     } catch (err) {
//       throw new Error(err);
//     }
//   });

//   const dislikeBlog = asyncHandler(async (req, res) => {
//     try {
//       const { blogId } = req.body;
//       const blog = await Blog.findById(blogId);
//       const loginUserId = req.user._id;
//       if (blog.isDisliked === false) {
//         blog.isDisliked = true;
//         await blog.save();
//       } else if (blog.isDisliked === true) {
//         blog.isDisliked = false;
//         await blog.save();
//       }
//       res.json(blog);
//     } catch (err) {
//       throw new Error(err);
//     }
//   });
