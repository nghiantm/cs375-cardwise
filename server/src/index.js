const dotenv = require('dotenv');
const app = require('./app');
const { connectDB } = require('./config/db');

// Load environment variables from .env file, if present
dotenv.config();

const PORT = process.env.PORT || 3000;

// Immediately invoked async function to connect to DB and start the server
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();