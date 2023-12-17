const Practice = require("../models/practiceModel");
const asyncHandler = require("express-async-handler");

const createPractice = asyncHandler(async (req, res) => {
  const create = await Practice.create(req.body);
  res.json(create);
});

const updatePractice = asyncHandler(async (req, res) => {
  const update = await Practice.findOne;
});

module.exports = { createPractice, updatePractice };
