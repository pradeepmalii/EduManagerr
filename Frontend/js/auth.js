// Auth logic with registration check
// Wrap in IIFE to avoid leaking globals and redeclaring API_BASE
(function () {
  if (typeof window.API_BASE === "undefined") {
    window.API_BASE = "https://edumanagerr-backend.onrender.com/api";

  }
  const API_BASE = window.API_BASE;

// Check if admin exists on page load
  async function checkAdminExists() {
    // Only run on pages that actually have auth forms
    const hasLogin = document.getElementById("loginForm");
    const hasRegister = document.getElementById("registerForm");
    if (!hasLogin && !hasRegister) {
      console.log("Auth: login/register elements not found; skipping checkAdminExists");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/check`);
      const data = await res.json();
      
      if (!data.exists) {
        // No admin exists, show registration form
        showRegisterForm();
      } else {
        // Admin exists, show login form with toggle option
        showLoginForm();
        const toggleLink = document.getElementById("toggleLink");
        const toggleText = document.getElementById("toggleText");
        const toggleBtn = document.getElementById("toggleBtn");
        if (toggleLink && toggleText && toggleBtn) {
          toggleLink.style.display = "block";
          toggleText.textContent = "Don't have an account?";
          toggleBtn.textContent = "Register";
        }
      }
    } catch (error) {
      console.error("Error checking admin:", error);
      showMessage("Error connecting to server", "error");
    }
  }

  function showLoginForm() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (loginForm) loginForm.style.display = "block";
    if (registerForm) registerForm.style.display = "none";
  }

  function showRegisterForm() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (loginForm) loginForm.style.display = "none";
    if (registerForm) registerForm.style.display = "block";
  }

  function toggleForm() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const toggleText = document.getElementById("toggleText");
    const toggleBtn = document.getElementById("toggleBtn");
    const loginVisible = loginForm && loginForm.style.display !== "none";
    if (loginVisible) {
      showRegisterForm();
      if (toggleText) toggleText.textContent = "Already have an account?";
      if (toggleBtn) toggleBtn.textContent = "Login";
    } else {
      showLoginForm();
      if (toggleText) toggleText.textContent = "Don't have an account?";
      if (toggleBtn) toggleBtn.textContent = "Register";
    }
    clearMessage();
  }

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  showLoading(true);
  clearMessage();

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      showMessage("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      showMessage(data.message || "Login failed. Please check your credentials.", "error");
    }
  } catch (error) {
    showMessage("Error connecting to server. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

async function handleRegister() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (!email || !password || !confirmPassword) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    return;
  }

  showLoading(true);
  clearMessage();

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("Registration successful! Please login.", "success");
      setTimeout(() => {
        showLoginForm();
        document.getElementById("email").value = email;
        clearMessage();
      }, 2000);
    } else {
      showMessage(data.message || "Registration failed. Email may already exist.", "error");
    }
  } catch (error) {
    showMessage("Error connecting to server. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

  function showMessage(text, type) {
    const messageEl = document.getElementById("message");
    if (!messageEl) {
      console.warn("message element not found on this page");
      return;
    }
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  function clearMessage() {
    const messageEl = document.getElementById("message");
    if (!messageEl) return;
    messageEl.textContent = "";
    messageEl.className = "message";
  }

  function showLoading(show) {
    const loadingEl = document.getElementById("loading");
    if (!loadingEl) return;
    loadingEl.style.display = show ? "block" : "none";
  }

// Allow Enter key to submit forms
  document.addEventListener("DOMContentLoaded", () => {
    const hasLogin = document.getElementById("loginForm");
    const hasRegister = document.getElementById("registerForm");

    // Only run auth checks on the login/register page
    if (hasLogin || hasRegister) {
      checkAdminExists();

      document.getElementById("email")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
      });

      document.getElementById("password")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
      });

      document.getElementById("regEmail")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
      });

      document.getElementById("regPassword")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
      });

      document.getElementById("regConfirmPassword")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
      });
    } else {
      // If this script is included on other pages (e.g., dashboard), skip auth UI logic
      console.log("Auth: login/register elements not found; skipping checkAdminExists");
    }
  });

  // Expose functions for inline handlers
  window.handleLogin = handleLogin;
  window.handleRegister = handleRegister;
  window.toggleForm = toggleForm;
  // Legacy function for backward compatibility
  window.login = async function () {
    handleLogin();
  };
})();
