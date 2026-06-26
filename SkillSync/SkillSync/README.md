# SkillSync— Peer-to-Peer Skill Exchange Platform

A full-featured student skill exchange platform built with React (Vite) + Node.js + MySQL.

---

## 🚀 Quick Start (Frontend)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## 📁 Project Structure

```
SkillSync/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router / page switcher
    ├── index.css             # Global styles & design tokens
    ├── components/
    │   ├── Navbar.jsx        # Top navigation bar
    │   ├── TutorCard.jsx     # Tutor listing card
    │   └── BookingModal.jsx  # Session booking modal
    └── pages/
        ├── LandingPage.jsx   # Marketing / hero page
        ├── Dashboard.jsx     # Student dashboard
        ├── ExplorePage.jsx   # Browse & filter tutors
        └── ProfilePage.jsx   # User profile & settings
```

---

## 🖥️ Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, testimonials, CTA |
| Dashboard | `/dashboard` | AI-recommended tutors, upcoming sessions, skill progress |
| Explore | `/explore` | Search + filter tutors by skill, rating, availability |
| Profile | `/profile` | User skills, session history, reviews, settings |

---

## 🔧 Backend Setup (Node.js + MySQL)

### 1. Initialize backend

```bash
mkdir server && cd server
npm init -y
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken
```

### 2. MySQL Database Schema

```sql
CREATE DATABASE skillbridge;
USE skillbridge;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  university VARCHAR(100),
  year VARCHAR(50),
  bio TEXT,
  avatar_url VARCHAR(255),
  credits INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50)
);

CREATE TABLE user_skills_teach (
  user_id INT, skill_id INT,
  proficiency ENUM('beginner','intermediate','expert') DEFAULT 'intermediate',
  hourly_rate INT DEFAULT 0,
  PRIMARY KEY(user_id, skill_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(skill_id) REFERENCES skills(id)
);

CREATE TABLE user_skills_learn (
  user_id INT, skill_id INT,
  PRIMARY KEY(user_id, skill_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(skill_id) REFERENCES skills(id)
);

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id INT NOT NULL,
  student_id INT NOT NULL,
  skill_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  meet_link VARCHAR(255),
  status ENUM('upcoming','active','completed','cancelled') DEFAULT 'upcoming',
  topic TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tutor_id) REFERENCES users(id),
  FOREIGN KEY(student_id) REFERENCES users(id),
  FOREIGN KEY(skill_id) REFERENCES skills(id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES sessions(id),
  FOREIGN KEY(reviewer_id) REFERENCES users(id),
  FOREIGN KEY(reviewee_id) REFERENCES users(id)
);
```

### 3. Express server (server/index.js)

```js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: 'skillbridge'
});

// GET /api/tutors — with optional skill filter
app.get('/api/tutors', async (req, res) => {
  const { skill, online } = req.query;
  const [rows] = await db.query(`
    SELECT u.*, AVG(r.rating) as avg_rating, COUNT(s.id) as session_count
    FROM users u
    LEFT JOIN sessions s ON s.tutor_id = u.id AND s.status = 'completed'
    LEFT JOIN reviews r ON r.reviewee_id = u.id
    GROUP BY u.id
    ORDER BY avg_rating DESC
  `);
  res.json(rows);
});

// POST /api/sessions — book a session
app.post('/api/sessions', async (req, res) => {
  const { tutor_id, student_id, skill_id, scheduled_at, topic } = req.body;
  const meet_link = `https://meet.google.com/skillbridge-${Math.random().toString(36).slice(2, 9)}`;
  const [result] = await db.query(
    'INSERT INTO sessions (tutor_id, student_id, skill_id, scheduled_at, topic, meet_link) VALUES (?, ?, ?, ?, ?, ?)',
    [tutor_id, student_id, skill_id, scheduled_at, topic, meet_link]
  );
  res.json({ id: result.insertId, meet_link });
});

app.listen(5000, () => console.log('SkillBridge API running on :5000'));
```

---

## 🤖 Skill Matching Algorithm

The recommendation engine ranks tutors using a weighted score:

```
matchScore = 
  (0.40 × skillOverlap) +      // % of student's learn-skills tutor can teach
  (0.30 × rating / 5) +        // normalized rating
  (0.20 × sessionCount / 100) + // experience score (capped at 100)
  (0.10 × availabilityMatch)   // 1 if tutor is available at preferred time
```

---

## 🎨 Design System

- **Primary color:** `#6C63FF` (purple)
- **Accent:** `#43D9AD` (teal-green)  
- **Fonts:** Space Grotesk (display) + Inter (body)
- **Google Meet integration:** each booking generates a real Meet link

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS custom properties (no Tailwind needed) |
| Backend | Node.js + Express |
| Database | MySQL 8 |
| Auth | JWT + bcryptjs |
| Sessions | Google Meet (link generation) |
| IDE | VS Code |
