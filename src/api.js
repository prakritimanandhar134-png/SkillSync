const BASE_URL = "http://localhost:5001/api";

// ── Get token from localStorage ──
const getToken = () => localStorage.getItem("token");

// ── Headers helper ──
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ════════════════════════════════
//  AUTH
// ════════════════════════════════

// Register
export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Login
export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Get current user
export const getMe = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });
  return res.json();
};

// ════════════════════════════════
//  USERS
// ════════════════════════════════

// Get all users
export const getAllUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Get single user
export const getUserById = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Update profile
export const updateProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/users/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};



// ════════════════════════════════
//  SKILLS
// ════════════════════════════════

export const getAllSkills = async () => {
  const res = await fetch(`${BASE_URL}/skills`);
  return res.json();
};
// Get my skills
export const getMySkills = async () => {
  const res = await fetch(`${BASE_URL}/skills/my`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Add skill to profile
export const addMySkill = async (data) => {
  const res = await fetch(`${BASE_URL}/skills/my`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// Remove skill
export const removeMySkill = async (id) => {
  const res = await fetch(`${BASE_URL}/skills/my/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};
// ════════════════════════════════
//  SESSIONS
// ════════════════════════════════

// Request a session
export const requestSession = async (data) => {
  const res = await fetch(`${BASE_URL}/sessions/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Booking request failed.");
  }

  return result;
};
// Get my sessions
export const getMySessions = async () => {
  const res = await fetch(`${BASE_URL}/sessions/my`, {
    headers: authHeaders(),
  });
  return res.json();
};


// Get pending requests (tutor)
export const getPendingSessions = async () => {
  const res = await fetch(`${BASE_URL}/sessions/pending`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pending sessions");
  }

  return res.json();
};

// Accept session
export const acceptSession = async (id) => {
  const res = await fetch(`${BASE_URL}/sessions/${id}/accept`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return res.json();
};

// Reject session
export const rejectSession = async (id, reason) => {
  const res = await fetch(`${BASE_URL}/sessions/${id}/reject`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return res.json();
};

// ════════════════════════════════
//  REVIEWS
// ════════════════════════════════

// Submit review
export const submitReview = async (data) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// Get reviews for a user
export const getUserReviews = async (id) => {
  const res = await fetch(`${BASE_URL}/reviews/user/${id}`, {
    headers: authHeaders(),
  });
  return res.json();
};

// ════════════════════════════════
//  MATCH & RECOMMENDATIONS
// ════════════════════════════════

// Get AI recommendations
export const getRecommendations = async () => {
  const res = await fetch(`${BASE_URL}/match/recommendations`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Check barter possibility
export const checkBarter = async (targetId) => {
  const res = await fetch(`${BASE_URL}/match/barter/${targetId}`, {
    headers: authHeaders(),
  });
  return res.json();
};

// ════════════════════════════════
//  ADMIN
// ════════════════════════════════

// Get admin stats
export const getAdminStats = async () => {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Get all users (admin)
export const getAdminUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Get all sessions (admin)
export const getAdminSessions = async () => {
  const res = await fetch(`${BASE_URL}/admin/sessions`, {
    headers: authHeaders(),
  });
  return res.json();
};

// Delete user (admin)
export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

// ── FORGOT PASSWORD ──────────────────────────
export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ email }),
  });
  return res.json();
};
// ── VERIFY OTP ───────────────────────────────
export const verifyOTP = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
};
// ── RESET PASSWORD ───────────────────────────
export const resetPassword = async (token, new_password) => {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ token, new_password }),
  });
  return res.json();
};

// ── CHANGE PASSWORD ──────────────────────────
export const changePassword = async (current_password, new_password) => {
  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method:"POST",
    headers:authHeaders(),
    body:JSON.stringify({ current_password, new_password }),
  });
  return res.json();
};



// ── UPLOAD AVATAR ────────────────────────────
export const uploadAvatar = async (avatar_url) => {
  const res = await fetch(`${BASE_URL}/users/avatar`, {
    method:"POST",
    headers:authHeaders(),
    body:JSON.stringify({ avatar_url }),
  });
  return res.json();
};

