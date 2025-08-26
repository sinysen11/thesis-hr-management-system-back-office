const mongoose = require('mongoose');

const jobTitleSchema = new mongoose.Schema({
      des_kh: { type: String, required: true},
      des_en: { type: String, required: true},
      department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
      requirenments: { type: String },
      describtion: { type: String }
}, {
      timestamps: true
});

module.exports = mongoose.model('JobTitle', jobTitleSchema);
