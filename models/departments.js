const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name_kh: { type: String, required: true},
    name_en: { type: String, required: true},
    description: { type: String, required: false},
}, {
    timestamps: true
})

module.exports = mongoose.model('Department', departmentSchema);
