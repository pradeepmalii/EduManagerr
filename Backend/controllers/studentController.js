const Student = require("../models/Student");

exports.addStudent = async (req, res) => {
  try {
    console.log("Add student request received:", req.body);
    console.log("Headers:", req.headers);
    
    const { name, email } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      console.log("Validation failed: Student name is required");
      return res.status(400).json({ message: "Student name is required" });
    }

    if (!email || email.trim() === "") {
      console.log("Validation failed: Student email is required");
      return res.status(400).json({ message: "Student email is required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log("Validation failed: Invalid email format");
      return res.status(400).json({ message: "Invalid email format" });
    }

    const student = await Student.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase() 
    });

    console.log("Student created successfully:", student);
    res.status(201).json(student);
  } catch (error) {
    console.error("Add student error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }
    res.status(500).json({ message: error.message || "Failed to add student" });
  }
};

exports.assignCourse = async (req, res) => {
  try {
    const studentId = req.params.id || req.body.studentId;
    const courseId = req.body.courseId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.course = courseId;
    await student.save();

    res.json({ message: "Student assigned to course successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("course");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMarks = async (req, res) => {
  try {
    const { studentId, subject, marks } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if marks for this subject already exist
    const existingMarkIndex = student.marks.findIndex(m => m.subject === subject);
    
    if (existingMarkIndex !== -1) {
      // Update existing marks
      student.marks[existingMarkIndex].marks = marks;
    } else {
      // Add new marks
      student.marks.push({ subject, marks });
    }

    await student.save();
    res.json({ message: "Marks added successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMarks = async (req, res) => {
  try {
    const { studentId, subject } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.marks = student.marks.filter(m => m.subject !== subject);
    await student.save();

    res.json({ message: "Marks deleted successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};