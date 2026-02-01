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

let timerInterval;

function startSession() {
  const result = document.getElementById("sessionResult");
  const timer = document.getElementById("sessionTimer");

  navigator.geolocation.getCurrentPosition(pos => {
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

        // ⏳ 5-minute timer
        let remaining = 300;
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
          const min = Math.floor(remaining / 60);
          const sec = remaining % 60;
          timer.innerText = `Session Active • Expires in ${min}:${sec < 10 ? "0" : ""}${sec}`;

          if (remaining-- <= 0) {
            clearInterval(timerInterval);
            timer.innerText = "Session expired";
          }
        }, 1000);
      })
      .catch(() => {
        result.innerText = "Error starting session";
      });
  });
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



function showTab(tabId) {
  // Hide all sections
  document.querySelectorAll(".tab-content").forEach(sec => {
    sec.classList.remove("active");
  });

  // Remove active from all buttons
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.remove("active");
  });

  // Show selected section
  document.getElementById(tabId).classList.add("active");

  // Activate clicked tab
  event.target.classList.add("active");
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// ================= TAB SWITCHING =================
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    // Remove active from all tabs
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    // Hide all content
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    // Activate clicked tab
    tab.classList.add("active");

    // Show matching content
    const target = tab.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
  });
});
