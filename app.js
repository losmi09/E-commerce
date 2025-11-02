import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with {type: 'json'};
import compression from 'compression';
import qs from 'qs';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import { router as productRouter } from './routes/productRoutes.js';
import { router as authRouter } from './routes/authRoutes.js';
import { router as userRouter } from './routes/userRoutes.js';
import { router as categoryRouter } from './routes/categoryRoutes.js';
import { router as cartRouter } from './routes/cartRoutes.js';

const app = express();

app.use(helmet());

app.use(cors());

const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again later',
});

const authLimit = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again later',
});

app.use('/api', limit);

app.use(express.json({ limit: '10kb' }));

app.use(xss());

app.set('query parser', str => qs.parse(str));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(hpp());

app.use(compression());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  if(req.method !== 'GET' && !req.body) req.body = {};
  next()
})

app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authLimit, authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/cart', cartRouter);

app.use((req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);

app.use(globalErrorHandler);

export default app;
