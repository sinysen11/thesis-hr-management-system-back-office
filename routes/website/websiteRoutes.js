require('dotenv').config();
const express = require('express');
const app = express();
const applicantRoutes = require('./applicantRoutes');
const { verifyApplicantToken } = require('../../middlewares/authMiddleware');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use('/applicant', applicantRoutes);

app.use(verifyApplicantToken);



module.exports = app;
