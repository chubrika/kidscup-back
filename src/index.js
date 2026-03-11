import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  });
};

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
