const BASE_URL = "https://attendance-backend-5-027k.onrender.com";


// 🔐 AUTH GUARD
(function protectPages() {
  const token = localStorage.getItem("token");
  const page = window.location.pathname;

  // Pages that require login
  const protectedPages = ["lecturer.html", "student.html"];

  if (protectedPages.some(p => page.includes(p)) && !token) {
    alert("Please login first");
    window.location.href = "index.html";
  }
})();

if (
  window.location.pathname.includes("lecturer.html") ||
  window.location.pathname.includes("student.html")
) {
  if (!localStorage.getItem("token")) {
    alert("Please login first");
    window.location.href = "index.html";
  }
}


function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      // 🔐 SAVE JWT TOKEN HERE
      localStorage.setItem("token", data.token);

      if (data.role === "teacher") {
        window.location.href = "lecturer.html";
      } else {
        window.location.href = "student.html";
      }
    })
    .catch(() => alert("Login failed"));
}


// ---------------- LECTURER ----------------
function startSession() {
    const result = document.getElementById("sessionResult");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
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
          result.innerHTML = `
            ✅ Session Started <br>
            <b>Session ID:</b> ${data.sessionId}
          `;
        })
        .catch(() => {
          result.innerText = "Error starting session";
        });
    },
    () => {
      result.innerText = "Location permission denied";
    }
  );
}



// ---------------- STUDENT ----------------

function markAttendance() {
  const sessionId = document.getElementById("sessionId").value;
  const result = document.getElementById("attendanceResult");

  if (!sessionId) {
    result.innerText = "Enter session ID";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
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
        .then(msg => {
          result.innerText = msg;
        })
        .catch(err => {
          result.innerText = "Error: " + err;
        });
    },
    () => {
      result.innerText = "Location permission denied";
    }
  );
}

function loadAttendance() {
  const sessionId = document.getElementById("viewSessionId").value;

  fetch(`${BASE_URL}/attendance/session/${sessionId}`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
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
          </tr>
        `;
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
    body: JSON.stringify({ sessionId, studentId, reason })
  })
    .then(res => res.text())
    .then(text => msg.innerText = text)
    .catch(() => msg.innerText = "Error marking attendance");
}
