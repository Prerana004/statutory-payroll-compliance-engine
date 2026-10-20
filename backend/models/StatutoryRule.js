const express = require("express");
const router = express.Router();
const StatutoryRule = require("../models/StatutoryRule");
const AuditLog = require("../models/AuditLog");
const checkSuperAdmin = require("../middleware/checkSuperAdmin");

// DELETE – SuperAdmin only
router.delete("/:id", checkSuperAdmin, async (req, res) => {
  try {
    const rule = await StatutoryRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    // 🧾 Audit log
    await AuditLog.create({
      action: "DELETE_STATUTORY_RULE",
      performedBy: req.headers["x-role"],
      ruleId: rule._id,
    });

    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
