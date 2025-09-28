const mongoose = require('mongoose');

const PublicHoliday = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model('PublicHoliday', PublicHoliday);
