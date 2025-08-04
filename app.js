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


app.use(errorHandler);

module.exports = app;
