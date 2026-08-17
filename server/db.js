const mongoose = require('mongoose');

// Connects to mongo and resolves once open. Kept out of app.js so the app can
// be imported without opening a connection
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not set. Copy server/.env.example to .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  // Later errors are usually transient and mongoose reconnects itself, so log
  // them rather than killing a running server
  mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err.message);
  });
}

module.exports = connectDB;
