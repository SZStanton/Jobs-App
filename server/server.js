// Must load before anything reads process.env. The explicit path means it works
// no matter which directory the process was started from
require('dotenv').config({
  path: require('node:path').join(__dirname, '.env'),
});

const app = require('./app');
const connectDB = require('./db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
