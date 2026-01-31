const BASE_URL = "https://attendance-backend-5-027k.onrender.com";

// ---------------- LECTURER ----------------
function startSession() {
  const teacherId = document.getElementById("teacherId").value;
  const result = document.getElementById("sessionResult");

  if (!teacherId) {
    result.innerText = "Please enter lecturer ID";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetch(`${BASE_URL}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
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
  const studentId = document.getElementById("studentId").value;
  const sessionId = document.getElementById("sessionId").value;
  const result = document.getElementById("attendanceResult");

  if (!studentId || !sessionId) {
    result.innerText = "Fill all fields";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetch(`${BASE_URL}/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
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
