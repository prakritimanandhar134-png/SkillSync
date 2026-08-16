const express = require("express");
const router = express.Router();

const { default: Checkauth } = require("../Controller/Checkauth");
const authMiddleware = require("../AuthMiddleware/Authmiddleware");

router.get(
  "/checkauth",
  authMiddleware,
  async (req, res) => {
    try {
      await Checkauth.Checkauthentiction(req, res);
    } catch (error) {
      console.error("Checkauth error:", error);

      res.status(500).json({
        success: false,
        message: "Authentication check failed",
        error: error.message,
      });
    }
  }
);

module.exports = router;