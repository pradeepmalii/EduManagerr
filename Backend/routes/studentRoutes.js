const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  addStudent,
  assignCourse,
  getStudents,
  deleteStudent,
  addMarks,
  deleteMarks
} = require("../controllers/studentController");

router.post("/", authMiddleware, addStudent);
router.post("/assign", authMiddleware, assignCourse);
router.post("/:id/assign", authMiddleware, assignCourse);
router.get("/", authMiddleware, getStudents);
router.delete("/:id", authMiddleware, deleteStudent);
router.post("/marks", authMiddleware, addMarks);
router.delete("/marks", authMiddleware, deleteMarks);

module.exports = router;
