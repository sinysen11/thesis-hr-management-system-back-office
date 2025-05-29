require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const jobTitleRoutes = require('./routes/jobTitleRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { verifyToken } = require('./middlewares/authMiddleware');

app.use(express.json());
app.use('/api/users', userRoutes);

app.use(verifyToken);

app.use('/api/departments', departmentRoutes);
app.use('/api/post-job', postRoutes);
app.use('/api/job-title', jobTitleRoutes);

app.use(errorHandler);

module.exports = app;
