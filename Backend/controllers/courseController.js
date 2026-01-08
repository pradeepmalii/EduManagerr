const Course = require("../models/Course");

exports.addCourse = async (req, res) => {
  try {
    console.log("Add course request received:", req.body);
    console.log("Headers:", req.headers);
    
    const { courseName, description, duration, subjects } = req.body;

    // Validation
    if (!courseName || courseName.trim() === "") {
      console.log("Validation failed: Course name is required");
      return res.status(400).json({ message: "Course name is required" });
    }

    if (!duration || isNaN(duration) || duration < 1 || duration > 48) {
      console.log("Validation failed: Invalid duration");
      return res
        .status(400)
        .json({ message: "Valid duration (in months) is required (1 - 48)" });
    }

    const course = await Course.create({
      courseName: courseName.trim(),
      description: description ? description.trim() : "",
      duration: parseInt(duration),
      subjects: subjects && Array.isArray(subjects) ? subjects.filter(s => s && s.trim() !== "") : []
    });

    console.log("Course created successfully:", course);
    res.status(201).json(course);
  } catch (error) {
    console.error("Add course error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course with this name already exists" });
    }
    res.status(500).json({ message: error.message || "Failed to add course" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
