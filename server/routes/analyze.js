const express = require("express");
const router = express.Router();
const { analyzeRequirements } = require("../services/gemini");

// POST /api/analyze
router.post("/", async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements || typeof requirements !== "string") {
      return res.status(400).json({
        error: "Bad request",
        message: "Please provide a 'requirements' field as a string.",
      });
    }

    if (requirements.trim().length < 20) {
      return res.status(400).json({
        error: "Bad request",
        message:
          "Requirements text is too short. Please provide more detail (at least 20 characters).",
      });
    }

    const analysis = await analyzeRequirements(requirements);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message || "Failed to analyze requirements.",
    });
  }
});

module.exports = router;
