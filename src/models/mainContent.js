const mongoose = require("mongoose");

const MainContentSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentImage' }],
  status: { type: String, default: "ACTIVE" },
},{
  timestamps: true
});

module.exports = mongoose.model("MainContent", MainContentSchema);
