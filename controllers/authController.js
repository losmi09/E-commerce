import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userSchema from '../schemas-validation/userSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import prisma from '../server.js';
import sendEmail from '../utils/email.js';
import * as userModel from '../models/userModel.js';

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const sanitizeOutput = user => {
  user.password =
    user.password_changed_at =
    user.password_reset_token =
    user.password_reset_token_expiry =
    user.email_verification_token =
    user.email_verification_token_expiry =
    user.is_verified =
    user.is_active =
      undefined;
};

const getEmailUrl = (req, path, token) =>
  `${req.protocol}://${req.get('host')}/api/v1/auth/${path}/${token}`;

const hashToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  sanitizeOutput(user);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message.replaceAll('"', '');
    return next(new AppError(errorMessage, 400));
  }

  const { firstName, lastName, email, password } = value;

  const hashedPassword = await userModel.hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      role: 'user',
    },
  });

  await prisma.cart.create({
    data: {
      user_id: newUser.id,
    },
  });

  // const verificationToken = await userModel.createToken(newUser, 'email');

  // const verificationUrl = getEmailUrl(req, 'verifyEmail', verificationToken);

  // const subject = 'Verify your email';

  // const text = `Verify your email by opening this link: ${verificationUrl}.`;

  // try {
  //   await sendEmail({
  //     to: email,
  //     subject,
  //     text,
  //   });
  // } catch (err) {
  //   await prisma.user.update({
  //     where: {
  //       id: newUser.id,
  //     },
  //     data: {
  //       email_verification_token: null,
  //       email_verification_token_expiry: null,
  //     },
  //   });

  //   return next(new AppError(err.message, 500));
  // }

  createSendToken(newUser, 201, res);
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  const [user] = await prisma.user.findMany({
    where: {
      email,
    },
  });

  if (!user || !(await userModel.comparePasswords(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, 200, res);
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = hashToken(req.params.token);

  const [user] = await prisma.user.findMany({
    where: {
      email_verification_token: hashedToken,
    },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      is_verified: true,
      email_verification_token: null,
      email_verification_token_expiry: null,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!',
  });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully',
  });
});

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError("You're logged out. Please log in to get access", 401)
    );

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user)
    return next(
      new AppError('The user belonging to token does no longer exist', 401)
    );

  if (
    user.password_changed_at &&
    userModel.checkForPasswordChange(decoded.iat, user.password_changed_at)
  )
    return next(
      new AppError("You've changed your password. Please sign in again", 401)
    );

  req.user = user;

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

  const [user] = await prisma.user.findMany({
    where: {
      email,
    },
  });

  if (!user)
    return next(new AppError('No user found with that email address', 404));

  const resetToken = await userModel.createToken(user, 'password');

  const resetUrl = getEmailUrl(req, 'resetPassword', resetToken);

  const subject = 'Reset your password';

  const text = `Submit a PATCH request to this url to reset your password: ${resetUrl}.`;

  try {
    await sendEmail({
      to: email,
      subject,
      text,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent successfully!',
    });
  } catch (err) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password_reset_token: null,
        password_reset_token_expiry: null,
      },
    });

    return next(new AppError(err.message, 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please enter a new password and confirm it', 400)
    );

  const hashedToken = hashToken(req.params.token);

  const [user] = await prisma.user.findMany({
    where: {
      password_reset_token: hashedToken,
    },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  if (typeof password === 'string' && password.length < 8)
    return next(
      new AppError('password length must be at least 8 characters long', 400)
    );

  if (await userModel.comparePasswords(password, user.password))
    return next(new AppError('New password cannot be the current one', 400));

  if (password !== passwordConfirm)
    return next(new AppError('Passwords do not match', 400));

  const hashedPassword = await userModel.hashPassword(password);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      password_changed_at: new Date(Date.now() - 1000),
      password_reset_token: null,
      password_reset_token_expiry: null,
    },
  });

  createSendToken(user, 200, res);
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

  let user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!(await userModel.comparePasswords(passwordCurrent, user.password)))
    return next(new AppError('Wrong password!', 401));

  if (await userModel.comparePasswords(password, user.password))
    return next(new AppError('New password cannot be the current one', 400));

  if (typeof password === 'string' && password.length < 8)
    return next(
      new AppError('password length must be at least 8 characters long', 400)
    );

  if (password !== passwordConfirm)
    return next(new AppError('Passwords do not match', 401));

  const hashedPassword = await userModel.hashPassword(password);

  user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      password: hashedPassword,
      password_changed_at: new Date(Date.now() - 1000),
    },
  });

  createSendToken(user, 200, res);
});
