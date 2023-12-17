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
    console.log("id in updateBlog fn", id);
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    // const updatedBlog = await Blog.findByIdAndUpdate(id);  // aisa krne se sirf aur sirf phla like title hi change ho rha sirf baki sare
    // description and catgory nhi ho rhe change aisa ku
    // agr mai req.body aur { new:true } na likhu fir bhi update ho rha but sirf ek hi update ho rha aur agr mai req.body likhu aur {new: true} na
    // kru to update nhi hoga
    console.log("updatedBlog in updateBlog fn", updatedBlog);
    res.json(updatedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // const blog = await Blog.findById(id).populate("likes").populate("disLikes"); // utube me ye line add krke yha pe populate kiya hai
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
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  //   console.log("blog?.dislikes in likeBlog fn", blog?.dislikes);
  //   const alreadyDisliked = blog?.dislikes?.find((userId) => {
  //     console.log("userId in likeBlog find fn", userId);
  //     userId?.toString() === loginUserId?.toString();
  //   });
  //   console.log("alreadyDisliked in likeBlog fn", alreadyDisliked);
  //   if (alreadyDisliked) {
  //     console.log(
  //       "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
  //     );
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
  // ye line no.82 se 101 tk comment krne pe bhi shi chl rha hai
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
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isDisLiked = blog?.isDisliked;
  // find if the user has disliked the blog
  //   const alreadyLiked = blog?.likes?.find(
  //     (userId) => userId?.toString() === loginUserId?.toString()
  //   );
  //   if (alreadyLiked) {
  //     console.log(
  //       "22222222222222222222222222222222222222222222222222222222222222222222222222222"
  //     );
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
  console.log("req.files in uploadImages fn", req.files);
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      console.log("newPath in uploadImg fn", newPath);
      urls.push(newPath);
      console.log("file in uploadBlogImages fn", file);
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
//       const loginUserId = req.user._id; // only login user can like and dislike the blog // how youl'll get if the user is logged in or not so
//       // with the help of auuthMiddleware
//       console.log(`loginUserId in likeBlog fn`, loginUserId);
//       console.log("blog.isLiked in likeBlog fn", blog.isLiked);
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
