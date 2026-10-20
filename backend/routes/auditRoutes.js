const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");

router.get("/", async (req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

module.exports = router;
