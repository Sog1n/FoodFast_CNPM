const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");

// GET /count -> trả về số lượng Restaurant trong DB
router.get("/count", async (req, res) => {
  try {
    const count = await Restaurant.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({
      error: "Unable to fetch the number of restaurants.",
    });
  }
});

module.exports = router;
