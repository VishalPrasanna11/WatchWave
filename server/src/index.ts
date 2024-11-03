import express, { Request, Response, NextFunction } from 'express';
import "dotenv/config";
import sequelize from './config/database';
import uploadRoutes from './routes/upload';
import { connectToPostgres } from './config/pgClient';
import cors from 'cors';
import userRoutes from './routes/user.Route';

const app = express();
app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use('/api/videos', uploadRoutes);
app.use('/v1/', userRoutes);

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

    app.listen(8081, () => {
      console.log('Server is running on port 8081');
    });
  } catch (error) {
    console.error('Error initializing application:', error);
  }
};

init();
