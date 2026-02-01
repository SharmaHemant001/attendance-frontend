const BASE_URL = "https://attendance-backend-5-027k.onrender.com";

console.log("🔥 main.js loaded");

/* ================= AUTH GUARD ================= */
(function () {
  const token = localStorage.getItem("token");
  if ((document.getElementById("lecturer-page") || document.getElementById("student-page")) && !token) {
    alert("Please login first");
    window.location.href = "index.html";
  }
})();

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  msg.innerText = "";

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.token) {
        msg.innerText = "Invalid credentials";
        return;
      }
      localStorage.setItem("token", data.token);
      window.location.href = data.role === "teacher" ? "lecturer.html" : "student.html";
    })
    .catch(() => msg.innerText = "Login failed");
}

/* ================= REGISTER ================= */
function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  const msg = document.getElementById("msg");

  msg.innerText = "";

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
    .then(res => res.json())
    .then(() => {
      msg.style.color = "green";
      msg.innerText = "Account created! Please login.";
      showLogin();
    })
    .catch(() => {
      msg.style.color = "red";
      msg.innerText = "Signup failed";
    });
}

/* ================= UI ================= */
function showSignup() {
  document.getElementById("loginBox").classList.remove("active");
  document.getElementById("signupBox").classList.add("active");
}

function showLogin() {
  document.getElementById("signupBox").classList.remove("active");
  document.getElementById("loginBox").classList.add("active");
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

/* ================= TABS ================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
});

/* ================= LECTURER ================= */
function startSession() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetch(`${BASE_URL}/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
      .then(res => res.json())
      .then(d => document.getElementById("sessionResult").innerHTML = `✅ Session ID: <b>${d.sessionId}</b>`);
  });
}

function loadAttendance() {
  const sessionId = document.getElementById("viewSessionId").value;
  const table = document.getElementById("attendanceTable");

  fetch(`${BASE_URL}/attendance/session/${sessionId}`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
    .then(res => res.json())
    .then(data => {
      table.innerHTML = "";
      data.forEach(r => {
        table.innerHTML += `
          <tr>
            <td>${r.studentId}</td>
            <td>${r.status}</td>
            <td>${r.manual ? "Yes" : "No"}</td>
            <td>${new Date(r.timestamp).toLocaleTimeString()}</td>
          </tr>`;
      });
    });
}

function manualMark() {
  const sessionId = document.getElementById("viewSessionId").value;
  const studentId = document.getElementById("manualStudentId").value;
  const reason = document.getElementById("manualReason").value;

  fetch(`${BASE_URL}/attendance/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ sessionId, studentId, reason })
  })
    .then(res => res.text())
    .then(t => document.getElementById("manualMsg").innerText = t);
}

/* ================= STUDENT ================= */
function markAttendance() {
  const sessionId = document.getElementById("sessionId").value;

  navigator.geolocation.getCurrentPosition(pos => {
    fetch(`${BASE_URL}/attendance/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ sessionId, lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
      .then(res => res.text())
      .then(t => document.getElementById("attendanceResult").innerText = t);
  });
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
