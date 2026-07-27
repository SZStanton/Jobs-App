const express = require('express');
const cors = require('cors');

require('./db'); // Import database connection

const jobsRoutes = require('./routes/jobs.routes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allow JSON request bodies

// Routes
app.use('/jobs', jobsRoutes);

// Start server on port 3000
app.listen(3000, function () {
  console.log('Server running on port 3000');
});
