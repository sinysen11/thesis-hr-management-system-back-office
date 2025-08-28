const mongoose = require('mongoose');

const postJobSchema = new mongoose.Schema({
      title: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTitle' },
      department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
      number_staff: { type: Number, required: true},
      publish_date: { type: Date, required: true},
      close_date: { type: Date, required: true},
      salary: { type: String, required: true },
      description: { type: String, required: true },
      responsible: { type: String, required: true },
      requirement: { type: String, required: true },
      branch: { type: String, required: true },
      benefits: { type: String, required: false }
}, {
      timestamps: true
});

module.exports = mongoose.model('PostJob', postJobSchema);