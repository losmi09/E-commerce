import AppError from '../utils/error/appError.js';

// Check if req.params are valid
const isIdNumber = (req, res, next) => {
  if (req.params.id === 'me' && req.originalUrl.includes('/users/'))
    return next();

  Object.values(req.params).forEach(value => {
    if (!Number.isFinite(Number(value)))
      return next(new AppError(`Invalid ID: ${value}`, 400));
  });

  next();
};

export default isIdNumber;
