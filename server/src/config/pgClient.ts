import { Client, ClientConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// PostgreSQL connection configuration
const pgConfig: ClientConfig = {
  user: process.env.PG_USER || 'USER',
  password: process.env.PG_PASSWORD || 'PASSWORD',
  host: process.env.PG_HOST || 'HOST',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'DATABASE',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.resolve(__dirname, '../certs/ca.pem')).toString(),
  },
};

// Initialize PostgreSQL client
const pgClient = new Client(pgConfig);

export const connectToPostgres = async () => {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL');
    const result = await pgClient.query("SELECT VERSION()");
    console.log('PostgreSQL Version:', result.rows[0]);
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    await pgClient.end();
  }
};
