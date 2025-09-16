require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const jobTitleRoutes = require('./routes/jobTitleRoutes');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');
const leaveRoutes = require('./routes/leaveRequestRoutes');
const roleRoutes = require('./routes/roleRoutes');
const PositionRoutes = require('./routes/positionRoutes');
const ApplicantRoutes = require('./routes/applicantRoutes');
const ReportRoutes = require('./routes/reportRoutes');
const MailRoutes = require('./routes/mailRoutes');
const ActivityLogRoutes = require('./routes/activitylogRoutes');
const UploadImageRoutes = require('./routes/imageRoutes');
const WebsiteControlRoutes = require('./routes/mainContentRoutes');
const websiteRoutes = require('./routes/website/websiteRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { verifyToken } = require('./middlewares/authMiddleware');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use('/api/users', authRoutes);
app.use('/api/v1', websiteRoutes);

app.use(verifyToken);

// WEB APPLICATION
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/post-job', postRoutes);
app.use('/api/job-title', jobTitleRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave-balance', userRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/position', PositionRoutes);
app.use('/api/get-applicant', ApplicantRoutes);
app.use('/api/leave', ReportRoutes);
app.use('/api/send-mail', MailRoutes);
app.use('/api/activity-log', ActivityLogRoutes);
app.use('/api/upload-image', UploadImageRoutes);
app.use('/api/web-modify', WebsiteControlRoutes);
app.use(errorHandler);

module.exports = app;
