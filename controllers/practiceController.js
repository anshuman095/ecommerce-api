const Practice = require("../models/practiceModel");
const asyncHandler = require("express-async-handler");
const { uploads } = require("../utils/cloudinaryPractice");

const createPractice = asyncHandler(async (req, res) => {
  const create = await Practice.create(req.body);
  res.json(create);
});

const updatePractice = asyncHandler(async (req, res) => {
  const update = await Practice.findOne;
});

const uploadVideoController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = req.files;

  var videoUrlList = [];

  for (var i = 0; i < req.files.length; i++) {
    var locaFilePath = req.files[i].path;
    var result = await uploads(locaFilePath);
    videoUrlList.push(result.url);
  }
  const video = await Practice.findByIdAndUpdate(
    id,
    {
      video: videoUrlList,
    },
    { new: true }
  );

  return res.status(200).send(video);
});

module.exports = { createPractice, updatePractice, uploadVideoController };
