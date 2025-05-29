const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    description: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Position', positionSchema);
