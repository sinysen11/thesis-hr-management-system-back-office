const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContentImage', ImageSchema);
