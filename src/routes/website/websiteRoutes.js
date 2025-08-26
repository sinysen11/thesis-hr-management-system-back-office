require('dotenv').config();
const express = require('express');
const app = express();
const applicantRoutes = require('./applicantRoutes');
const getJobRoutes = require('./jobRoutes');
const applyJob = require('./applyJobRoutes');
const { verifyApplicantToken } = require('../../middlewares/authMiddleware');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use('/applicant', applicantRoutes);
app.use('/job-posting', getJobRoutes);

app.use(verifyApplicantToken);

app.use('/submit', applyJob);
module.exports = app;
