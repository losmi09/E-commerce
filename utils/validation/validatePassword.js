import { comparePasswords } from '../../services/authService.js';
import AppError from '../error/appError.js';

const validatePassword = async ({
  passwordCurrent = null,
  password,
  passwordConfirm,
  user,
}) => {
  const { password: userPassword } = user;

  if (
    passwordCurrent &&
    !(await comparePasswords(passwordCurrent, userPassword))
  )
    throw new AppError('Your current password is incorrect', 401);

  if (password.length < 8)
    throw new AppError(
      'password length must be at least 8 characters long',
      400
    );

  if (await comparePasswords(password, userPassword))
    throw new AppError('New password cannot be the current one', 400);

  if (password !== passwordConfirm)
    throw new AppError('Passwords do not match', 400);
};

export default validatePassword;
