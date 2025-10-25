import AppError from './appError.js';

const isIdNumber = (req, res, next) => {
  if (!Number.isFinite(+req.params.id))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));

  next();
};

export default isIdNumber;
