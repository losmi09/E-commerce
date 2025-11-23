import jwt from 'jsonwebtoken';
import userSchema from '../schemas-validation/userSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error/appError.js';
import sanitizeOutput from '../utils/sanitizeOutput.js';
import sendMessage from '../utils/response/sendMessage.js';
import * as userRepository from '../repositories/userRepository.js';
import * as cartRepository from '../repositories/cartRepository.js';
import * as authService from '../services/authService.js';
import throwErrorMessage from '../utils/error/throwErrorMessage.js';

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendCookie = (token, res) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    expires: new Date(Date.now() + +process.env.COOKIE_EXPIRES_IN),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

const respondWithUser = (statusCode, token, user, res) => {
  // Sanitize user's sensitive data
  sanitizeOutput(user);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

const sendAuthResponse = (user, statusCode, res) => {
  // Sign JWT
  const token = signToken(user.id);

  // send JWT in httpOnly cookie
  sendCookie(token, res);

  respondWithUser(statusCode, token, user, res);
};

export const signup = catchAsync(async (req, res) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) throwErrorMessage(error);

  const newUser = await authService.signup(value);

  sendAuthResponse(newUser, 201, res);
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  const user = await userRepository.findUserByEmail(email);

  // Verify user exists and password matches
  if (!user || !(await authService.comparePasswords(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  sendAuthResponse(user, 200, res);
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  await authService.verifyEmail(token);

  sendMessage('Email verified successfully!', res);
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  sendMessage('User logged out successfully', res);
});

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

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email)
    return next(new AppError('Please enter the email of your account', 400));

  await authService.forgotPassword(email);

  sendMessage(
    'If an user with this email address exists, password reset email will be sent!',
    res
  );
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  const { token } = req.params;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please enter a new password and confirm it', 400)
    );

  const user = await authService.updatePassword({
    token,
    password,
    passwordConfirm,
  });

  sendAuthResponse(user, 200, res);
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm)
    return next(
      new AppError(
        'Please enter your current password, then new one and confirm it',
        400
      )
    );

  const user = await authService.updatePassword({
    userId: req.user.id,
    passwordCurrent,
    password,
    passwordConfirm,
  });

  sendAuthResponse(user, 200, res);
});
