const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  addCourse,
  getCourses,
  deleteCourse
} = require("../controllers/courseController");

router.post("/", authMiddleware, addCourse);
router.get("/", authMiddleware, getCourses);
router.delete("/:id", authMiddleware, deleteCourse);

module.exports = router;
