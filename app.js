const express = require('express');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const JobTitleRoutes = require('./routes/jobTitleRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/post-job', postRoutes);
app.use('/api/job-title', JobTitleRoutes);

app.use(errorHandler);

module.exports = app;
