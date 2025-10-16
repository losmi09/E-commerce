import { PrismaClient } from '@prisma/client';
import app from './app.js';

const prisma = new PrismaClient();

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server running on port ${port}...`));

export default prisma;
