const mongoose = require("mongoose");

const TabSchema = new mongoose.Schema({
  mainContentId: { type: mongoose.Schema.Types.ObjectId, ref: "MainContent", required: true },
  title: { type: String, required: true },
  points: [{ type: String }],
  status: { type: String, default: "ACTIVE" },
}, {
  timestamps: true
});

module.exports = mongoose.model("MainContentTab", TabSchema);
