import { extname } from 'path';
import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import prisma from '../server.js';
import { removeFromOutput } from './authController.js';
import { comparePasswords } from '../models/userModel.js';

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

const fileFilter = (req, file, cb) => {
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

  if (req.body.photo === 'null') filteredBody.photo = 'default.jpg';

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      ...filteredBody,
    },
  });

  removeFromOutput(updatedUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deactivateMe = catchAsync(async (req, res, next) => {
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
    where: {
      id: +req.user.id,
    },
  });

  if (!(await comparePasswords(passwordCurrent, user.password)))
    return next(new AppError('Passwords do not match', 401));

  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });

  res.status(204).end();
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
    },
  });

  users.forEach(user => removeFromOutput(user));

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: +req.params.id,
    },
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  removeFromOutput(user);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await prisma.user.delete({
    where: {
      id: +req.params.id,
    },
  });

  res.status(204).end();
});
