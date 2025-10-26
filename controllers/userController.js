import { extname } from 'path';
import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import prisma from '../server.js';
import { sanitizeOutput } from './authController.js';
import { comparePasswords } from '../models/userModel.js';
import * as factory from './handlerFactory.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = extname(file.originalname);
//     cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
//   },
// });

const storage = multer.memoryStorage();

export const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images', 400));
};

const upload = multer({
  storage,
  fileFilter,
});

export const resizeuserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const ext = extname(req.file.originalname);

  req.file.filename = `user-${req.user.id}-${Date.now()}${ext}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

export const uploadUserPhoto = upload.single('photo');

export const getUsersPhoto = catchAsync(async (req, res, next) => {
  let where = { id: +req.params.id };

  if (req.params.id === 'me') where = { id: +req.user.id };

  const user = await prisma.user.findUnique({
    where: where,
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  const { photo } = user;

  if (photo === 'default.jpg')
    return res.status(200).json({
      status: 'success',
      message: 'User does not have a profile picture',
    });

  res.status(200).json({
    status: 'success',
    photo: `${req.protocol}://${req.get(
      'host'
    )}/api/v1/public/img/users/${photo}`,
  });
});

export const deleteUsersPhoto = catchAsync(async (req, res, next) => {
  let where = { id: +req.user.id };

  if (req.user.role === 'admin') where = { id: +req.params.id };

  const user = await prisma.user.update({
    where,
    data: {
      photo: 'default.jpg',
    },
  });

  if (!user || user.length === 0)
    return next(new AppError('No user found with that ID', 404));

  sanitizeOutput(user);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password updates. Please use /auth/updateMyPassword',
        400
      )
    );

  const filteredBody = filterObj(req.body, 'first_name', 'last_name', 'email');

  // if (req.body.photo === 'null') filteredBody.photo = 'default.jpg';

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      ...filteredBody,
    },
  });

  sanitizeOutput(updatedUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deactivateMe = catchAsync(async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      isActive: false,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Your account has been successfully deactivated',
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const { passwordCurrent } = req.body;

  if (!passwordCurrent)
    return next(new AppError('Please enter your password', 400));

  const user = await prisma.user.findUnique({
    where: { id: +req.user.id },
  });

  if (!(await comparePasswords(passwordCurrent, user.password)))
    return next(new AppError('Wrong password!', 401));

  await prisma.cart.delete({
    where: { userId: +req.user.id },
  });

  await prisma.user.delete({
    where: { id: +req.user.id },
  });

  res.status(204).end();
});

export const getAllUsers = factory.getAll('user', 'id');
export const getUser = factory.getOne('user');
export const deleteUser = factory.deleteOne('user');
