// Students frontend logic
// Wrapped to avoid leaking globals and redeclaring API_BASE
(function () {
  if (typeof window.API_BASE === "undefined") {
    window.API_BASE = "http://localhost:5000/api";
  }
  const API_BASE = window.API_BASE;

  function getToken() {
    return localStorage.getItem("token");
  }

  async function addStudent(e) {
    console.log("=== addStudent function called ===", e);
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const nameEl = document.getElementById("studentName");
    const emailEl = document.getElementById("studentEmail");
    
    if (!nameEl || !emailEl) {
      console.error("Form elements not found!");
      alert("Error: Form elements not found. Please refresh the page.");
      return;
    }
    
    const name = nameEl.value;
    const email = emailEl.value;
    
    console.log("Form values:", { name, email });
    
    if (!name || !email) {
      const msg = "Please fill in all fields";
      console.log("Validation failed:", msg);
      showStudentMessage(msg, "error");
      return;
    }

    const token = getToken();
  if (!token) {
    showStudentMessage("Not authenticated. Please login again.", "error");
    window.location.href = "login.html";
    return;
  }

  const requestBody = { name, email };
  console.log("Adding student:", requestBody);

  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log("Response status:", res.status, res.statusText);
    
    let data;
    try {
      const text = await res.text();
      console.log("Response text:", text);
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("JSON parse error:", e);
      data = { message: `Server error: ${res.status} ${res.statusText}` };
    }

    console.log("Response data:", data);

    if (res.ok) {
      console.log("Student added successfully!");
      showStudentMessage("Student added successfully!", "success");
      document.getElementById("studentForm").reset();
      loadStudents();
    } else {
      console.error("Failed to add student:", data);
      showStudentMessage(data.message || `Failed to add student (${res.status})`, "error");
      if (res.status === 401) {
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = "login.html", 2000);
      }
    }
  } catch (error) {
    console.error("Add student error:", error);
    showStudentMessage(`Error: ${error.message || "Failed to connect to server"}`, "error");
  }
}

async function loadStudents() {
  try {
    const studentRes = await fetch(`${API_BASE}/students`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!studentRes.ok) {
      if (studentRes.status === 401) {
        window.location.href = "login.html";
        return;
      }
      throw new Error("Failed to load students");
    }

    const students = await studentRes.json();

    const courseRes = await fetch(`${API_BASE}/courses`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    const courses = await courseRes.json();

    const container = document.getElementById("studentsList");
    container.innerHTML = "";

    if (students.length === 0) {
      container.innerHTML = '<div class="empty-state">No students added yet</div>';
      return;
    }

    students.forEach(student => {
      const card = document.createElement("div");
      card.className = "card student-card";
      
      // Get all subjects from student's course
      const studentCourse = courses.find(c => c._id === student.course?._id);
      const availableSubjects = studentCourse?.subjects || [];
      
      // Build marks display
      let marksHtml = "";
      if (student.marks && student.marks.length > 0) {
        marksHtml = student.marks.map(mark => `
          <div class="mark-item">
            <span><strong>${mark.subject}:</strong> ${mark.marks}/100</span>
            <button class="btn btn-danger btn-small" onclick="deleteMarks('${student._id}', '${mark.subject}')">Delete</button>
          </div>
        `).join('');
      } else {
        marksHtml = '<p style="color: #999; font-size: 0.9em;">No marks added</p>';
      }

      // Build add marks form
      let addMarksForm = "";
      if (availableSubjects.length > 0) {
        addMarksForm = `
          <div class="add-marks-form">
            <select id="markSubject_${student._id}">
              <option value="">Select Subject</option>
              ${availableSubjects.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <input type="number" id="markValue_${student._id}" placeholder="Marks (0-100)" min="0" max="100">
            <button class="btn btn-primary btn-small" onclick="addMarks('${student._id}')">Add Marks</button>
          </div>
        `;
      } else {
        addMarksForm = '<p style="color: #999; font-size: 0.9em;">Assign a course to add marks</p>';
      }

      card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="card-title">${student.name}</div>
            <div style="color: #666; font-size: 0.9em; margin-top: 5px;">${student.email}</div>
          </div>
          <button class="btn btn-danger btn-small" onclick="deleteStudent('${student._id}')">Delete</button>
        </div>
        <div class="card-body">
          <p><strong>Course:</strong> ${student.course?.courseName || "No Course Assigned"}</p>
          ${student.course ? `
            <select onchange="assignCourse('${student._id}', this.value)" style="margin-top: 10px; padding: 8px; width: 100%; border: 2px solid #e0e0e0; border-radius: 6px;">
              <option value="">Change Course</option>
              ${courses.map(c => `
                <option value="${c._id}" ${student.course?._id === c._id ? 'selected' : ''}>${c.courseName}</option>
              `).join('')}
            </select>
          ` : `
            <select onchange="assignCourse('${student._id}', this.value)" style="margin-top: 10px; padding: 8px; width: 100%; border: 2px solid #e0e0e0; border-radius: 6px;">
              <option value="">Assign Course</option>
              ${courses.map(c => `<option value="${c._id}">${c.courseName}</option>`).join('')}
            </select>
          `}
        </div>
        <div class="marks-section">
          <strong style="display: block; margin-bottom: 10px;">Marks</strong>
          <div class="marks-list">
            ${marksHtml}
          </div>
          ${addMarksForm}
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading students:", error);
    showStudentMessage("Error loading students", "error");
  }
}

async function assignCourse(studentId, courseId) {
  if (!courseId) return;

  try {
    const res = await fetch(`${API_BASE}/students/${studentId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ courseId })
    });

    if (res.ok) {
      showStudentMessage("Course assigned successfully!", "success");
      loadStudents();
    } else {
      const data = await res.json();
      showStudentMessage(data.message || "Failed to assign course", "error");
    }
  } catch (error) {
    showStudentMessage("Error assigning course", "error");
  }
}
window.assignCourse = assignCourse;

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (res.ok) {
      showStudentMessage("Student deleted successfully!", "success");
      loadStudents();
    } else {
      const data = await res.json();
      showStudentMessage(data.message || "Failed to delete student", "error");
    }
  } catch (error) {
    showStudentMessage("Error deleting student", "error");
  }
}
window.deleteStudent = deleteStudent;

async function addMarks(studentId) {
  const subject = document.getElementById(`markSubject_${studentId}`).value;
  const marks = parseInt(document.getElementById(`markValue_${studentId}`).value);

  if (!subject || marks === undefined || marks < 0 || marks > 100) {
    showStudentMessage("Please select a subject and enter valid marks (0-100)", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/students/marks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ studentId, subject, marks })
    });

    const data = await res.json();

    if (res.ok) {
      showStudentMessage("Marks added successfully!", "success");
      document.getElementById(`markSubject_${studentId}`).value = "";
      document.getElementById(`markValue_${studentId}`).value = "";
      loadStudents();
    } else {
      showStudentMessage(data.message || "Failed to add marks", "error");
    }
  } catch (error) {
    showStudentMessage("Error adding marks", "error");
  }
}
window.addMarks = addMarks;

async function deleteMarks(studentId, subject) {
  if (!confirm(`Are you sure you want to delete marks for ${subject}?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/students/marks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ studentId, subject })
    });

    if (res.ok) {
      showStudentMessage("Marks deleted successfully!", "success");
      loadStudents();
    } else {
      const data = await res.json();
      showStudentMessage(data.message || "Failed to delete marks", "error");
    }
  } catch (error) {
    showStudentMessage("Error deleting marks", "error");
  }
}
window.deleteMarks = deleteMarks;

function showStudentMessage(text, type) {
  const messageEl = document.getElementById("studentMessage");
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    console.log(`Student message [${type}]:`, text);
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "message";
    }, 5000);
  } else {
    console.error("Student message element not found!");
    alert(`${type.toUpperCase()}: ${text}`);
  }
}

// Make functions globally accessible immediately
window.addStudent = addStudent;

// Initialize
(function() {
  function init() {
    console.log("Initializing students module");
    const studentForm = document.getElementById("studentForm");
    if (studentForm) {
      studentForm.addEventListener("submit", function(e) {
        e.preventDefault();
        addStudent(e);
      });
      console.log("Student form event listener attached");
    } else {
      console.error("Student form not found!");
    }
    loadStudents();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
})();
