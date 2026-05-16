const app = require('./app');
const connectDatabase = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      // Server boot log is intentionally concise for local dev readability.
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

startServer();
