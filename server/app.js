const express = require('express');
const cors = require('cors');

const jobsRoutes = require('./routes/jobs.routes');

const app = express();

// Only the deployed frontend, falling back to the vite dev server locally
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Render sleeps the free tier after 15 minutes, so the client can hit this to
// wake it rather than making someone wait on their first real request
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/jobs', jobsRoutes);

module.exports = app;
