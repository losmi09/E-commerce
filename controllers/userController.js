import multer from 'multer';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error/appError.js';
import fileFilter from '../utils/image/fileFilter.js';
import resizeTheImage from '../utils/image/resizeTheImage.js';
import sendMessage from '../utils/response/sendMessage.js';
import generateFileName from '../utils/image/generateFileName.js';
import sendData from '../utils/response/sendData.js';
import * as userService from '../services/userService.js';
import * as factory from './handlerFactory.js';

const storage = multer.memoryStorage();

const upload = multer({ storage, fileFilter });

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.fileName = generateFileName('user', req.user.id);

  await resizeTheImage(req.file.buffer, 'users', req.file.fileName);

  next();
});

export const uploadUserPhoto = upload.single('image');

export const getCurrentUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password updates. Please use /me/password',
        400
      )
    );

  const updatedUser = await userService.updateUser(
    req.body,
    req.file,
    req.user.id
  );

  sendData(res, updatedUser, 'user');
});

export const deactivateCurrentUser = catchAsync(async (req, res) => {
  await userService.deactivateUser(req.user.id);

  sendMessage('Your account has been successfully deactivated', res);
});

export const deleteCurrentUser = catchAsync(async (req, res, next) => {
  const { passwordCurrent } = req.body;

  if (!passwordCurrent)
    return next(new AppError('Please enter your password', 400));

  await userService.deleteUser(req.user.id, passwordCurrent);

  res.status(204).end();
});

export const getAllUsers = factory.getAll('user');
export const getUser = factory.getOne('user');
export const deleteUser = factory.deleteOne('user');
