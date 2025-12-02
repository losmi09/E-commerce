import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import app from './app.js';

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION 💥');
  console.log(err.name, err.message);
  process.exit(1);
});

const prisma = new PrismaClient();

export const client = createClient({
  port: Number(process.env.REDIS_PORT) || 6379,
  host: process.env.REDIS_HOST || '127.0.0.1',
});

const connectRedisClient = async () => {
  try {
    await client.connect();
  } catch (err) {
    console.log('Redis Client Error', err);
  }
};

await connectRedisClient();

const port = process.env.PORT || 8000;

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}...`)
);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

export default prisma;
