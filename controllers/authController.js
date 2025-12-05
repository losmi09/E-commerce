import userSchema from '../schemas/userSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error/appError.js';
import sanitizeOutput from '../utils/sanitizeOutput.js';
import sendMessage from '../utils/response/sendMessage.js';
import * as userRepository from '../repositories/userRepository.js';
import * as authService from '../services/authService.js';
import throwErrorMessage from '../utils/error/throwErrorMessage.js';

const sendRefreshTokenCookie = (refreshToken, res) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN)),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

const clearRefreshTokenCookie = res => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

const respondWithUser = (statusCode, accessToken, user, res) => {
  // Sanitize user's sensitive data
  sanitizeOutput(user);

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};

const sendAuthResponse = async (user, statusCode, res) => {
  const { id: userId } = user;

  const { accessToken, refreshToken } =
    await authService.prepareAccessAndRefreshToken(userId);

  sendRefreshTokenCookie(refreshToken, res);

  respondWithUser(statusCode, accessToken, user, res);
};

export const register = catchAsync(async (req, res) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) throwErrorMessage(error);

  const newUser = await authService.register(value);

  await sendAuthResponse(newUser, 201, res);
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  const user = await userRepository.findUserByEmail(email);

  // Verify user exists and password matches
  if (!user || !(await authService.comparePasswords(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  await sendAuthResponse(user, 200, res);
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return next(new AppError('Refresh token is required', 401));

  clearRefreshTokenCookie(res);

  const { newAccessToken, newRefreshToken } = await authService.refreshToken(
    refreshToken
  );

  sendRefreshTokenCookie(newRefreshToken, res);

  res.status(200).json({
    status: 'success',
    accessToken: newAccessToken,
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.params.token);

  sendMessage('Email verified successfully!', res);
});

export const logout = catchAsync(async (req, res) => {
  clearRefreshTokenCookie(res);

  await userRepository.revokeRefreshToken(req.user.id);

  sendMessage('User logged out successfully', res);
});

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

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please enter a new password and confirm it', 400)
    );

  const user = await authService.updatePassword({
    token: req.params.token,
    password,
    passwordConfirm,
  });

  await sendAuthResponse(user, 200, res);
});

export const updateCurrentUserPassword = catchAsync(async (req, res, next) => {
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

  await sendAuthResponse(user, 200, res);
});
