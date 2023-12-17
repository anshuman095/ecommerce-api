const express = require("express");
const {
  updatePractice,
  createPractice,
} = require("../controllers/practiceController");
const router = express.Router();

router.post("/createPractice", createPractice);
router.post("/updatePractice", updatePractice);

module.exports = router;
