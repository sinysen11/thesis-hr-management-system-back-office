const mongoose = require('mongoose');
const fillOnlineSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    resume: {
        fileName: { type: String, required: true },
        fileType: { type: String, default: 'application/pdf' },
        fileSize: Number,
        url: { type: String, required: true }
    },
    isNID: { type: Boolean, required: true },
    isCovidVac: { type: Boolean, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model("FillOnlineForm", fillOnlineSchema);