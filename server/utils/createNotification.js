const { pool } = require("../config/db");

async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId = null,
}) {
  try {
    await pool.query(
      `
      INSERT INTO notifications
      (user_id, type, title, message, reference_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, type, title, message, referenceId]
    );
  } catch (error) {
    console.error("Create notification error:", error);
  }
}

module.exports = createNotification;