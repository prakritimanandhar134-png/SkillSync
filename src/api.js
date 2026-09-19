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

// Get unread message counts
export const getUnreadMessageCounts = async () => {
  const res = await fetch(`${BASE_URL}/messages/unread/counts`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load unread counts.");
  }

  return data;
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

// Get my notifications
export const getNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return res.json();
};

// Mark notification as read
export const markNotificationRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });

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

export const completeSession = async (sessionId) => {
  const response = await fetch(
    `${BASE_URL}/sessions/${sessionId}/complete`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to complete session.");
  }

  return data;
};

// ════════════════════════════════
//  REVIEWS
// ════════════════════════════════

// Submit review for a completed session
export const submitReview = async ({
  session_id,
  rating,
  comment = "",
}) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      session_id,
      rating,
      comment,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to submit review."
    );
  }

  return data;
};

// Get reviews received by a user
export const getUserReviews = async (id) => {
  const res = await fetch(
    `${BASE_URL}/reviews/user/${id}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to fetch user reviews."
    );
  }

  return data;
};

// Get average rating and review count
export const getUserRating = async (id) => {
  const res = await fetch(
    `${BASE_URL}/reviews/user/${id}/summary`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to fetch rating summary."
    );
  }

  return data;
};

// Check whether the current student already reviewed a session
export const getSessionReview = async (sessionId) => {
  const res = await fetch(
    `${BASE_URL}/reviews/session/${sessionId}`,
    {
      headers: authHeaders(),
    }
  );

  if (res.status === 404) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to check session review."
    );
  }

  return data;
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

// ─────────────────────────────────────────────
// CHAT / MESSAGES
// ─────────────────────────────────────────────

export const getMessages = async (userId) => {
  const response = await fetch(
    `${BASE_URL}/messages/${userId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load messages."
    );
  }

  return data;
};

export const sendMessage = async ({
  receiver_id,
  message,
}) => {
  const response = await fetch(
    `${BASE_URL}/messages`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiver_id,
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send message."
    );
  }

  return data;
};

export const markMessagesAsRead = async (userId) => {
  const response = await fetch(
    `${BASE_URL}/messages/${userId}/read`,
    {
      method: "PATCH",
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to mark messages as read."
    );
  }

  return data;
};