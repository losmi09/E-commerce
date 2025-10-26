import AppError from './appError.js';

const isIdNumber = (req, res, next) => {
  Object.values(req.params).forEach(value => {
    if (!Number.isFinite(+value))
      return next(new AppError(`Invalid ID: ${value}`, 400));
  });

  next();
};

export default isIdNumber;
