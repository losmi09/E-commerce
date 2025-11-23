import crypto from 'crypto';
import bcrypt from 'bcrypt';
import validatePassword from '../utils/validation/validatePassword.js';
import AppError from '../utils/error/appError.js';
import * as emailService from './emailService.js';
import * as userRepository from '../repositories/userRepository.js';
import * as cartRepository from '../repositories/cartRepository.js';

export const hashPassword = async password => await bcrypt.hash(password, 12);

export const comparePasswords = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

export const checkForPasswordChange = (JWTTimestamp, passwordChangeTimeStamp) =>
  JWTTimestamp * 1000 <
  new Date(passwordChangeTimeStamp - 2 * 60 * 60 * 1000).getTime();

export const hashToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createToken = async (user, field) => {
  const token = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await userRepository.setUserToken(field, hashedToken, user.id);

  return token;
};

export const signup = async value => {
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

export const verifyEmail = async token => {
  const hashedToken = hashToken(token);

  const user = await userRepository.findUserByToken(hashedToken, 'email');

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  await userRepository.setUserVerified(user.id);
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
  let hashedToken;

  if (token) hashedToken = hashToken(token);

  const user = token
    ? await userRepository.findUserByToken(hashedToken, 'password')
    : await userRepository.findUserById(userId);

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
