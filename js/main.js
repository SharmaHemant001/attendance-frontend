const BASE_URL = "https://attendance-backend-5-027k.onrender.com";

/* ================= AUTH GUARD ================= */
(function () {
  const token = localStorage.getItem("token");
  if ((document.getElementById("lecturer-page") || document.getElementById("student-page")) && !token) {
    alert("Please login first");
    window.location.href = "index.html";
  }
})();

/* ================= AUTH ================= */
function login() {
  const username = usernameInput.value;
  const password = passwordInput.value;
  msg.innerText = "";

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.token) return msg.innerText = "Invalid credentials";
      localStorage.setItem("token", data.token);
      window.location.href = data.role === "teacher" ? "lecturer.html" : "student.html";
    })
    .catch(() => msg.innerText = "Login failed");
}

function register() {
  const username = regUsername.value;
  const password = regPassword.value;
  const role = regRole.value;
  msg.innerText = "";

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
    .then(res => res.json())
    .then(() => {
      msg.innerText = "Account created! Please login.";
      showLogin();
    })
    .catch(() => msg.innerText = "Signup failed");
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

/* ================= TABS (FIXED) ================= */
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
      .then(d => sessionResult.innerHTML = `✅ Session ID: <b>${d.sessionId}</b>`);
  });
}

function loadAttendance() {
  fetch(`${BASE_URL}/attendance/session/${viewSessionId.value}`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
    .then(res => res.json())
    .then(data => {
      attendanceTable.innerHTML = "";
      data.forEach(r => {
        attendanceTable.innerHTML += `
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
  fetch(`${BASE_URL}/attendance/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      sessionId: viewSessionId.value,
      studentId: manualStudentId.value,
      reason: manualReason.value
    })
  })
    .then(res => res.text())
    .then(t => manualMsg.innerText = t);
}

/* ================= STUDENT ================= */
function markAttendance() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetch(`${BASE_URL}/attendance/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        sessionId: sessionId.value,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
    })
      .then(res => res.text())
      .then(t => attendanceResult.innerText = t);
  });
}
