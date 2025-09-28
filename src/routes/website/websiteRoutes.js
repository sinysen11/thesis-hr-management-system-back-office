require('dotenv').config();
const express = require('express');
const app = express();
const applicantRoutes = require('./applicantRoutes');
const getJobRoutes = require('./jobRoutes');
const applyJob = require('./applyJobRoutes');
const DocumentRoutes = require('../../routes/documentRoutes');
const MainContentRoutes = require('./mainContentRoutes');
const { verifyApplicantToken } = require('../../middlewares/authMiddleware');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use('/applicant', applicantRoutes);
app.use('/job-posting', getJobRoutes);
app.use('/website', MainContentRoutes);

app.use(verifyApplicantToken);
app.use('/document', DocumentRoutes);
app.use('/apply-job/submit', applyJob);
module.exports = app;
