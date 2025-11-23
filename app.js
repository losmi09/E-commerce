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
import AppError from './utils/error/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import { router as productRouter } from './routes/productRoutes.js';
import { router as authRouter } from './routes/authRoutes.js';
import { router as userRouter } from './routes/userRoutes.js';
import { router as categoryRouter } from './routes/categoryRoutes.js';
import { router as cartRouter } from './routes/cartRoutes.js';


// Initialize express app
const app = express();

// Set secure HTTP headers
app.use(helmet());

// Set up CORS (Access-Control-Allow-Origin header)
app.use(cors());

// Rate limit
const limit = rateLimit({
  max: +process.env.RATE_LIMIT_MAX,
  windowMs: +process.env.RATE_LIMIT_WINDOW,
  message: 'Too many requests. Please try again later',
});

// Rate limit for auth routes
const authLimit = rateLimit({
  max: +process.env.AUTH_RATE_LIMIT_MAX,
  windowMs: +process.env.AUTH_RATE_LIMIT_WINDOW,
  message: 'Too many requests. Please try again later',
});


// Body parser (parses incoming request into req.body), limit body payload to 10 kilobytes
app.use(express.json({ limit: '10kb' }));

// Data sanitization against XSS
app.use(xss());

app.set('query parser', str => qs.parse(str));

// Log requests in development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Prevent parameter pollution
app.use(hpp());

// Compress size of responses
app.use(compression());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ensure req.body exists when req.method isn't GET
app.use((req, res, next) => {
  if(req.method !== 'GET' && !req.body) req.body = {};
  next()
})

// Routes
app.use('/api/v1/products', limit, productRouter);
app.use('/api/v1/auth', authLimit, authRouter);
app.use('/api/v1/users', limit, userRouter);
app.use('/api/v1/categories', limit, categoryRouter);
app.use('/api/v1/cart', limit, cartRouter);

// Handle unhandled routes
app.use((req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);

app.use(globalErrorHandler);

export default app;
