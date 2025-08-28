const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model("ActivityLog", logSchema);