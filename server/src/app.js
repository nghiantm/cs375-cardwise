const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');
const spendingRouter = require('./routes/spending');

const app = express();

// Enable CORS for all origins. In production, configure this appropriately.
app.use(cors());

// Built‑in middleware for parsing JSON bodies
app.use(express.json());

// Mount health routes under /api
app.use('/api', healthRoutes);
app.use('/api/users', usersRouter); 
app.use('/api/spending', spendingRouter);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;