const mongoose = require('mongoose');

const postJobSchema = new mongoose.Schema({
      title: { type: String, required: true},
      type: { type: String, required: true},
      salary: { type: String, required: true},
      description: { type: String, required: true},
      responsible: { type: String, required: true},
      requirement: { type: String, required: true},
      benefits: { type: String, required: false}
});

module.exports = mongoose.model('PostJob', postJobSchema);