const mongoose = require('mongoose');

// MongoDB connection string, connect to MongoDB
const uri = 'mongodb://127.0.0.1:27017/maintenance_db';
mongoose.connect(uri);

// Handle connection errors
mongoose.connection.on('error', function () {
  console.log('Could not connect to database');
  process.exit();
});

// Run once connection successful
mongoose.connection.once('open', function () {
  console.log('Connected to MongoDB');
});
