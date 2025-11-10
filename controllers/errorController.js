import AppError from '../utils/appError.js';

const handleExpiredToken = () =>
  new AppError('Your token has expired. Please log in again', 401);

const handleInvalidToken = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleUniqueConstraint = err => {
  const { modelName, target } = err.meta;
  let message = `${modelName} with this ${target[0]} already exists`;
  if (modelName === 'Review') message = `You already reviewed this product`; // because of compound index
  return new AppError(message, 400);
};

const handleNotFoundRecord = err => {
  const { modelName, constraint } = err.meta;
  let fieldName = constraint.split('_')[1];
  if (modelName === 'ProductImage') fieldName = 'product';
  return new AppError(`No ${fieldName} found with that ID`, 404);
};

const handleFileCountLimit = err =>
  new AppError(`You can upload up to 3 ${err.field}`, 422);

const sendErrorDev = (err, res) => {
  const { statusCode, status, message, stack } = err;

  res.status(statusCode).json({
    status,
    message,
    error: err,
    stack,
  });
};

const sendErrorProd = (err, res) => {
  const { isOperational, statusCode, status, message } = err;

  if (isOperational)
    return res.status(statusCode).json({
      status,
      message,
    });

  res.status(500).json({
    status: 'error',
    message: 'Something Went Wrong!',
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (err.message.includes('Unique constraint'))
      error = handleUniqueConstraint(err);
    if (err.code === 'P2025' || err.code === 'P2003')
      error = handleNotFoundRecord(err);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') error = handleFileCountLimit(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredToken();
    if (err.name === 'JsonWebTokenError' || err instanceof SyntaxError)
      error = handleInvalidToken();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
