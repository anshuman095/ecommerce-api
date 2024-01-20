const express = require("express");
const {
  updatePractice,
  createPractice,
  uploadVideoController,
} = require("../controllers/practiceController");
const router = express.Router();
upload = require("../middlewares/uploadImagePractice"),

router.post("/createPractice", createPractice);
router.post("/updatePractice", updatePractice);
router.put("/uploadVideo/:id", upload.videoUpload.any(), uploadVideoController)

module.exports = router;
