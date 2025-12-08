// server/src/app.js
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');
const spendingRouter = require('./routes/spending');
const statementsRouter = require('./routes/statements');
const cardsRouter = require('./routes/cards');
const recommendationsRouter = require('./routes/recommendations');

const app = express();

// Enable CORS for all origins. In production, configure this appropriately.
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Your Vite dev server
      'https://drexel-cardwise.vercel.app' // Your production frontend URL
    ],
    credentials: true,
  })
);

// Built-in middleware for parsing JSON bodies
app.use(express.json());

// Mount routes under /api
app.use('/api', healthRoutes);
app.use('/api/users', usersRouter);
app.use('/api/spending', spendingRouter);
app.use('/api/statements', statementsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/recommendations', recommendationsRouter);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
