-- ─────────────────────────────────────────
--  SkillSync Database Schema
-- ─────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS skillsync;
USE skillsync;

-- ── USERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100)  NOT NULL,
  email        VARCHAR(100)  UNIQUE NOT NULL,
  password     VARCHAR(255)  NOT NULL,
  role         ENUM('user','admin') DEFAULT 'user',
  university   VARCHAR(100),
  year         VARCHAR(50),
  bio          TEXT,
  location     VARCHAR(100),
  avatar_url   VARCHAR(255),
  skill_score  INT DEFAULT 0,
  is_online    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SKILLS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  category   ENUM('Programming','Design','Business','Languages','Music','Science','Other') DEFAULT 'Other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── SKILLS USER CAN TEACH ──────────────────
CREATE TABLE IF NOT EXISTS user_skills_teach (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  skill_id    INT NOT NULL,
  proficiency ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Intermediate',
  hourly_rate INT DEFAULT 0,
  UNIQUE KEY unique_teach (user_id, skill_id),
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ── SKILLS USER WANTS TO LEARN ─────────────
CREATE TABLE IF NOT EXISTS user_skills_learn (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  skill_id INT NOT NULL,
  UNIQUE KEY unique_learn (user_id, skill_id),
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ── SESSIONS ───────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id         INT NOT NULL,
  student_id       INT NOT NULL,
  skill_id         INT NOT NULL,
  scheduled_at     DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  meet_link        VARCHAR(255),
  topic            TEXT,
  is_barter        BOOLEAN DEFAULT FALSE,
  amount           INT DEFAULT 0,
  status           ENUM('pending','upcoming','active','completed','cancelled') DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id)   REFERENCES skills(id) ON DELETE CASCADE
);

-- ── REVIEWS ────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  session_id  INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (session_id, reviewer_id),
  FOREIGN KEY (session_id)  REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── BARTER REQUESTS ────────────────────────
CREATE TABLE IF NOT EXISTS barter_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  requester_id    INT NOT NULL,
  receiver_id     INT NOT NULL,
  requester_skill INT NOT NULL,
  receiver_skill  INT NOT NULL,
  message         TEXT,
  status          ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_skill) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_skill)  REFERENCES skills(id) ON DELETE CASCADE
);

-- ── MESSAGES ───────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── SEED: Default skills ───────────────────
INSERT IGNORE INTO skills (name, category) VALUES
  ('React', 'Programming'), ('Node.js', 'Programming'),
  ('Python', 'Programming'), ('Java', 'Programming'),
  ('JavaScript', 'Programming'), ('TypeScript', 'Programming'),
  ('DSA', 'Programming'), ('Machine Learning', 'Programming'),
  ('Data Science', 'Programming'), ('DevOps', 'Programming'),
  ('Docker', 'Programming'), ('AWS', 'Programming'),
  ('Android', 'Programming'), ('Flutter', 'Programming'),
  ('UI/UX', 'Design'), ('Figma', 'Design'),
  ('Graphic Design', 'Design'), ('Illustration', 'Design');
 

-- ── SEED: Admin user ──────────────────────
-- Password is: admin123 (bcrypt hashed)
INSERT IGNORE INTO users (full_name, email, password, role) VALUES
  ('Admin', 'admin@skillsync.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
