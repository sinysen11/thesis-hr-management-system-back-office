const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String }, 
  method: { type: String },
  endpoint: { type: String },
  requestBody: { type: Object },
  queryParams: { type: Object },
  statusCode: { type: Number },
  responseMessage: { type: String },
  describtion: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);