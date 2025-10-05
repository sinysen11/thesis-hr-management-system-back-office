const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
