import express, { Request, Response, NextFunction } from 'express';
import "dotenv/config";
import sequelize from './config/database';
import uploadRoutes from './routes/upload';
import { connectToPostgres } from './config/pgClient';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/videos', uploadRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialize PostgreSQL connection and start server
const init = async () => {
  try {
    // await connectToPostgres(); // Connect to PostgreSQL directly
    await sequelize.sync(); // Sync Sequelize models

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Error initializing application:', error);
  }
};

init();
