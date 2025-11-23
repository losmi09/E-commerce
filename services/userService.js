import sanitizeOutput from '../utils/sanitizeOutput.js';
import * as authService from './authService.js';
import AppError from '../utils/error/appError.js';
import * as cartRepository from '../repositories/cartRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const updateMe = async (reqBody, file, userId) => {
  const filteredBody = filterObj(reqBody, 'firstName', 'lastName', 'email');

  if (file) filteredBody.image = file.fileName;

  const updatedUser = await userRepository.updateUser(userId, filteredBody);

  sanitizeOutput(updatedUser);

  return updatedUser;
};

export const deactivateMe = async userId =>
  await userRepository.deactivateUser(userId);

export const deleteMe = async (userId, passwordCurrent) => {
  const user = await userRepository.findUserById(userId);

  if (!(await authService.comparePasswords(passwordCurrent, user.password)))
    throw new AppError('Your current password is incorrect', 401);

  await cartRepository.deleteUserCart(userId);

  await userRepository.deleteUser(userId);

  // deleteImage('users', user.image);
};
