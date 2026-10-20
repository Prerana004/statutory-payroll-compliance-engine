const express = require("express");
const router = express.Router(); // ✅ THIS WAS MISSING
const Statutory = require("../models/Statutory");
const authMiddleware = require("../middleware/authMiddleware");

// 🔐 CREATE (JWT protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const rule = new Statutory(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: "Error saving data" });
  }
});

// 🔐 READ (JWT protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rules = await Statutory.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

// 🔐 DELETE (SuperAdmin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  await Statutory.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
