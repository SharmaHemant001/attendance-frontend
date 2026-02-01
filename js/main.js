const BASE_URL = "https://attendance-backend-5-027k.onrender.com";

// 👁 Show / Hide Password
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// 🌙 Dark Mode
function toggleDark() {
  document.body.classList.toggle("dark");
}

// 🔐 Password Strength Meter
function checkStrength() {
  const pwd = document.getElementById("regPassword").value;
  const bar = document.getElementById("strengthBar");

  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;

  const colors = ["red", "orange", "yellow", "lightgreen", "green"];
  bar.style.width = (strength * 25) + "%";
  bar.style.background = colors[strength];
}


/* ---------------- UI TOGGLES ---------------- */

function showSignup() {
  document.getElementById("loginBox").classList.remove("active");
  document.getElementById("signupBox").classList.add("active");
  document.getElementById("msg").innerText = "";
}

function showLogin() {
  document.getElementById("signupBox").classList.remove("active");
  document.getElementById("loginBox").classList.add("active");
  document.getElementById("msg").innerText = "";
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

/* ---------------- PASSWORD STRENGTH ---------------- */

function checkStrength() {
  const pwd = document.getElementById("regPassword").value;
  const bar = document.getElementById("strengthBar");

  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;

  const colors = ["red", "orange", "yellow", "lightgreen", "green"];
  bar.style.width = (strength * 25) + "%";
  bar.style.background = colors[strength];
}

/* ---------------- AUTH GUARD ---------------- */

(function () {
  const token = localStorage.getItem("token");
  const isLecturer = document.getElementById("lecturer-page");
  const isStudent = document.getElementById("student-page");

  if ((isLecturer || isStudent) && !token) {
    alert("Please login first");
    window.location.href = "index.html";
  }
})();

console.log("🔥 main.js loaded");

/* ---------------- LOGIN ---------------- */

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const loader = document.getElementById("loginLoader");
  const msg = document.getElementById("msg");

  if (!username || !password) {
    msg.innerText = "Enter username and password";
    return;
  }

  loader.style.display = "block";
  msg.innerText = "";

document.getElementById("loginLoader").style.display = "block";

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      loader.style.display = "none";

document.getElementById("loginLoader").style.display = "none";

      if (!data.token) {
        msg.innerText = "Invalid credentials";
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.role === "teacher") {
        window.location.href = "lecturer.html";
      } else {
        window.location.href = "student.html";
      }
    })
    .catch(() => {
      document.getElementById("loginLoader").style.display = "none";

      loader.style.display = "none";
      msg.innerText = "Login failed";

     

    });
}

/* ---------------- REGISTER ---------------- */

function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  const msg = document.getElementById("msg");
  const btn = document.getElementById("signupBtn");
  const spinner = document.getElementById("spinner");

  if (!username || !password || !role) {
    msg.innerText = "Fill all fields";
    return;
  }

  // UI loading state
  btn.disabled = true;
  spinner.style.display = "block";
  msg.innerText = "";

  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    })
    .then(data => {
      msg.style.color = "green";
      msg.innerText = "Account created! Please login";
      showLogin();
    })
    .catch(err => {
      msg.style.color = "red";
      msg.innerText = err.message || "Signup failed";
    })
    .finally(() => {
      spinner.style.display = "none";
      btn.disabled = false;
    });
}


/* ---------------- LECTURER ---------------- */

function startSession() {
  const result = document.getElementById("sessionResult");

  navigator.geolocation.getCurrentPosition(
    pos => {
      fetch(`${BASE_URL}/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      })
        .then(res => res.json())
        .then(data => {
          result.innerHTML = `✅ Session Started<br><b>Session ID:</b> ${data.sessionId}`;
        })
        .catch(() => result.innerText = "Error starting session");
    },
    () => result.innerText = "Location permission denied"
  );
}

/* ---------------- STUDENT ---------------- */

function markAttendance() {
  const sessionId = document.getElementById("sessionId").value;
  const result = document.getElementById("attendanceResult");

  if (!sessionId) {
    result.innerText = "Enter session ID";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      fetch(`${BASE_URL}/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          sessionId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      })
        .then(res => res.text())
        .then(msg => result.innerText = msg)
        .catch(() => result.innerText = "Error marking attendance");
    },
    () => result.innerText = "Location permission denied"
  );
}

/* ---------------- TEACHER VIEW ---------------- */

function loadAttendance() {
  const sessionId = document.getElementById("viewSessionId").value;

  fetch(`${BASE_URL}/attendance/session/${sessionId}`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("attendanceTable");
      tbody.innerHTML = "";

      data.forEach(r => {
        tbody.innerHTML += `
          <tr>
            <td>${r.studentId}</td>
            <td>${r.status}</td>
            <td>${r.manual ? "Yes" : "No"}</td>
          </tr>`;
      });
    });
}

function manualMark() {
  const sessionId = document.getElementById("viewSessionId").value;
  const studentId = document.getElementById("manualStudentId").value;
  const reason = document.getElementById("manualReason").value;
  const msg = document.getElementById("manualMsg");

  if (!sessionId || !studentId || !reason) {
    msg.innerText = "Fill all fields";
    return;
  }

  fetch(`${BASE_URL}/attendance/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
  sessionId,
  username: document.getElementById("manualStudentUsername").value,
  reason
})
  })
    .then(res => res.text())
    .then(text => msg.innerText = text)
    .catch(() => msg.innerText = "Error marking attendance");
}

function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  document.getElementById(tab + "Tab").classList.add("active");
  event.target.classList.add("active");
}
