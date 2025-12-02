import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error/appError.js';
import * as authService from '../services/authService.js';
import * as cartRepository from '../repositories/cartRepository.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from authorization header
  if (req.headers?.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError("You're logged out. Please log in to get access", 401)
    );

  const user = await authService.protect(token);

  req.user = user;

  req.user.cartId = await cartRepository.getUserCartId(user.id);

  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );

    next();
  };
};
