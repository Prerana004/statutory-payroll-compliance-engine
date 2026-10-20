const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: String, // admin / superadmin
    required: true,
  },
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StatutoryRule",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
