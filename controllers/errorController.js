import AppError from '../utils/appError.js';

const handleExpiredToken = () =>
  new AppError('Your token has expired. Please log in again', 401);

const handleInvalidToken = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleUniqueConstraint = err => {
  const { modelName, target } = err.meta;
  const message = `${modelName} with this ${target[0]} already exists`;
  return new AppError(message, 400);
};

const handleViolatedFkey = err => {
  const { constraint } = err.meta;
  const fieldName = constraint.split('_')[1];
  return new AppError(`No ${fieldName} found with that ID`, 404);
};

const handleNotFoundRecord = err => {
  const { modelName } = err.meta;
  const message = `No ${modelName} found with that ID`;
  return new AppError(message, 404);
};

const handleFileCountLimit = err =>
  new AppError(`You can upload up to 3 ${err.field}`, 400);

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
    if (err.code === 'P2025') error = handleNotFoundRecord(err);
    if (err.code === 'P2003') error = handleViolatedFkey(err);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') error = handleFileCountLimit(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredToken();
    if (
      err.name === 'JsonWebTokenError' || // err instanceof SyntaxError
      err.message.startsWith(
        'Bad control character in string literal in JSON at position'
      ) ||
      err.message.startsWith('Unterminated string in JSON at position') ||
      err.message.startsWith('Unexpected token')
    )
      error = handleInvalidToken();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
