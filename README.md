# 📍 Smart Attendance System – Backend

A secure, real-world backend system for managing classroom attendance using **JWT authentication**, **location verification**, and **time-bound sessions**.

This backend is designed to prevent proxy attendance while still allowing flexibility for real classroom scenarios.

---

## 🚀 Features

- 🔐 **JWT-based Authentication**
  - Role-based access (Teacher / Student)
  - Secure token-protected APIs

- 🧑‍🏫 **Teacher Controls**
  - Start time-limited attendance sessions
  - View attendance list in real time
  - Manual attendance override with reason logging

- 🧑‍🎓 **Student Attendance**
  - Attendance allowed only during active sessions
  - Location-based validation to ensure physical presence
  - Duplicate attendance prevention

- ⏱️ **Session Management**
  - Auto-expiring attendance sessions
  - Backend-controlled session lifecycle

- 🛡️ **Security & Validation**
  - Protected routes using JWT
  - Input validation
  - Role-based access control

---

## 🧠 Tech Stack

- Node.js  
- Express.js  
- MongoDB Atlas  
- Mongoose  
- JSON Web Tokens (JWT)  
- REST APIs  

---

## 🌐 API Overview

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/auth/register` | User signup |
| POST | `/auth/login` | User login |
| POST | `/session/start` | Start attendance session (Teacher) |
| POST | `/attendance/mark` | Mark attendance (Student) |
| GET | `/attendance/session/:id` | View attendance list (Teacher) |
| POST | `/attendance/manual` | Manual attendance override (Teacher) |

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
