// Course frontend logic
// Wrapped to avoid leaking globals and redeclaring API_BASE
(function () {
  if (typeof window.API_BASE === "undefined") {
    window.API_BASE = "http://localhost:5000/api";
  }
  const API_BASE = window.API_BASE;

  function getToken() {
    return localStorage.getItem("token");
  }

  let subjects = [];

  function addSubject() {
    const subjectInput = document.getElementById("subjectInput");
    const subject = subjectInput.value.trim();
    
    if (subject && !subjects.includes(subject)) {
      subjects.push(subject);
      updateSubjectsList();
      subjectInput.value = "";
    }
  }
  // Expose immediately
  window.addSubject = addSubject;

  function removeSubject(subject) {
    subjects = subjects.filter(s => s !== subject);
    updateSubjectsList();
  }
  // Expose immediately
  window.removeSubject = removeSubject;

function updateSubjectsList() {
  const list = document.getElementById("subjectsList");
  list.innerHTML = "";
  
  subjects.forEach(subject => {
    const tag = document.createElement("div");
    tag.className = "subject-tag";
    tag.innerHTML = `
      <span>${subject}</span>
      <button onclick="removeSubject('${subject}')" type="button">×</button>
    `;
    list.appendChild(tag);
  });
}

async function addCourse(e) {
  console.log("=== addCourse function called ===", e);
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const courseNameEl = document.getElementById("courseName");
  const descriptionEl = document.getElementById("courseDesc");
  const durationEl = document.getElementById("courseDuration");
  
  if (!courseNameEl || !durationEl) {
    console.error("Form elements not found!");
    alert("Error: Form elements not found. Please refresh the page.");
    return;
  }
  
  const courseName = courseNameEl.value;
  const description = descriptionEl.value;
  const duration = durationEl.value;
  
  console.log("Form values:", { courseName, description, duration, subjects });
  
  if (!courseName || !duration) {
    const msg = "Please fill in course name and duration";
    console.log("Validation failed:", msg);
    showCourseMessage(msg, "error");
    return;
  }

  const token = getToken();
  if (!token) {
    showCourseMessage("Not authenticated. Please login again.", "error");
    window.location.href = "login.html";
    return;
  }

  const requestBody = { 
    courseName, 
    description, 
    duration: parseInt(duration),
    subjects 
  };

  console.log("Adding course:", requestBody);

  try {
    const res = await fetch(`${API_BASE}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
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
      console.log("Course added successfully!");
      showCourseMessage("Course added successfully!", "success");
      document.getElementById("courseForm").reset();
      subjects = [];
      updateSubjectsList();
      loadCourses();
    } else {
      console.error("Failed to add course:", data);
      showCourseMessage(data.message || `Failed to add course (${res.status})`, "error");
      if (res.status === 401) {
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = "login.html", 2000);
      }
    }
  } catch (error) {
    console.error("Add course error:", error);
    showCourseMessage(`Error: ${error.message || "Failed to connect to server"}`, "error");
  }
}

async function loadCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: {
        "Authorization": "Bearer " + getToken()
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "login.html";
        return;
      }
      throw new Error("Failed to load courses");
    }

    const courses = await res.json();
    const container = document.getElementById("courseList");
    container.innerHTML = "";

    if (courses.length === 0) {
      container.innerHTML = '<div class="empty-state">No courses added yet</div>';
      return;
    }

    courses.forEach(course => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${course.courseName}</div>
          <button class="btn btn-danger btn-small" onclick="deleteCourse('${course._id}')">Delete</button>
        </div>
        <div class="card-body">
          <p><strong>Duration:</strong> ${course.duration} ${course.duration === 1 ? 'Month' : 'Months'}</p>
          ${course.description ? `<p><strong>Description:</strong> ${course.description}</p>` : ''}
          ${course.subjects && course.subjects.length > 0 ? `
            <p><strong>Subjects:</strong></p>
            <div class="subjects-list">
              ${course.subjects.map(s => `<span class="subject-tag"><span>${s}</span></span>`).join('')}
            </div>
          ` : '<p>No subjects added</p>'}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading courses:", error);
    showCourseMessage("Error loading courses", "error");
  }
}

  async function deleteCourse(id) {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + getToken()
        }
      });

      if (res.ok) {
        showCourseMessage("Course deleted successfully!", "success");
        loadCourses();
      } else {
        const data = await res.json();
        showCourseMessage(data.message || "Failed to delete course", "error");
      }
    } catch (error) {
      showCourseMessage("Error deleting course", "error");
    }
  }
  // Expose immediately
  window.deleteCourse = deleteCourse;

function showCourseMessage(text, type) {
  const messageEl = document.getElementById("courseMessage");
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    console.log(`Course message [${type}]:`, text);
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "message";
    }, 5000);
  } else {
    console.error("Course message element not found!");
    alert(`${type.toUpperCase()}: ${text}`);
  }
}

  // Make addCourse globally accessible immediately
  window.addCourse = addCourse;

  // Initialize
  (function() {
    function init() {
      console.log("Initializing courses module");
      const courseForm = document.getElementById("courseForm");
      if (courseForm) {
        courseForm.addEventListener("submit", function(e) {
          e.preventDefault();
          addCourse(e);
        });
        console.log("Course form event listener attached");
      } else {
        console.error("Course form not found!");
      }
      loadCourses();
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
})();
