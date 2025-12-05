import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import validatePassword from '../utils/validation/validatePassword.js';
import AppError from '../utils/error/appError.js';
import * as emailService from './emailService.js';
import * as userRepository from '../repositories/userRepository.js';
import * as cartRepository from '../repositories/cartRepository.js';

export const generateAccessToken = userId =>
  jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });

export const generateRefreshToken = userId =>
  jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
  });

export const prepareAccessAndRefreshToken = async userId => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const hashedRefreshToken = hashToken(refreshToken);

  await userRepository.setRefreshToken(userId, hashedRefreshToken);

  return { accessToken, refreshToken };
};

export const hashPassword = async password => await bcrypt.hash(password, 12);

export const comparePasswords = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

export const checkForPasswordChange = (JWTTimestamp, passwordChangeTimestamp) =>
  JWTTimestamp * 1000 <
  new Date(passwordChangeTimestamp - 2 * 60 * 60 * 1000).getTime();

export const hashToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createToken = async (user, field) => {
  const token = crypto.randomBytes(32).toString('hex');

  const hashedToken = hashToken(token);

  await userRepository.setUserToken(field, hashedToken, user.id);

  return token;
};

export const register = async value => {
  const { firstName, lastName, email, password } = value;

  const hashedPassword = await hashPassword(password);

  const newUser = await userRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  // Create cart for user immediately when he registers
  await cartRepository.createUsersCart(newUser.id);

  const emailVerificationToken = await createToken(newUser, 'email');

  await emailService.sendEmailVerification(newUser, emailVerificationToken);

  return newUser;
};

export const refreshToken = async refreshToken => {
  // Verify refresh token
  const { id: userId } = await jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const hashedRefreshToken = hashToken(refreshToken);

  const user = await userRepository.findUserByRefreshToken(hashedRefreshToken);

  if (!user) {
    // Token reuse detected
    await userRepository.revokeRefreshToken(userId);
    throw new AppError("You can't use the same refresh token twice", 403);
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await prepareAccessAndRefreshToken(userId);

  return { newAccessToken, newRefreshToken };
};

export const verifyEmail = async token => {
  const hashedToken = hashToken(token);

  const user = await userRepository.findUserByToken(hashedToken, 'email');

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  await userRepository.setUserVerified(user.id);
};

export const protect = async accessToken => {
  // Verify access token
  const { id, iat } = await jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithms: ['HS256'],
    }
  );

  // Find user by id that is in token payload
  const user = await userRepository.findUserById(id);

  if (!user)
    throw new AppError('The user belonging to token does no longer exist', 401);

  // Check if password was changed after the token was issued
  if (
    user.passwordChangedAt &&
    checkForPasswordChange(iat, user.passwordChangedAt)
  )
    throw new AppError(
      "You've changed your password. Please sign in again",
      401
    );

  return user;
};

export const forgotPassword = async email => {
  const user = await userRepository.findUserByEmail(email);

  const passwordResetToken = await createToken(user, 'password');

  if (user) {
    const { subject, text } = await emailService.preparePasswordResetEmail(
      passwordResetToken
    );

    try {
      await emailService.sendEmail({
        to: email,
        subject,
        text,
      });
    } catch {
      // Find user by email and clean his password reset token
      await userRepository.cleanUserToken(email, 'password');

      throw new AppError(
        'Password reset email failed. Please try again later',
        500
      );
    }
  }
};

export const updatePassword = async ({
  userId = null,
  token = null,
  passwordCurrent,
  password,
  passwordConfirm,
}) => {
  let hashedToken, user;

  if (token) {
    hashedToken = hashToken(token);
    user = await userRepository.findUserByToken(hashedToken, 'password');
  } else user = await userRepository.findUserById(userId);

  if (!user) {
    const errorMessage = token
      ? 'Token is invalid or has expired'
      : 'No user found with that ID';

    throw new AppError(errorMessage, 400);
  }

  await validatePassword({ passwordCurrent, password, passwordConfirm, user });

  const hashedPassword = await hashPassword(password);

  await userRepository.updateUserPassword({
    userId,
    token: hashedToken,
    hashedPassword,
  });

  return user;
};
