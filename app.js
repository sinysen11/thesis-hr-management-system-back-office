const express = require('express');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
