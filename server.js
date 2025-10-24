import { PrismaClient } from '@prisma/client';
import app from './app.js';

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION 💥');
  console.log(err.name, err.message);
  process.exit(1);
});

const prisma = new PrismaClient();

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
