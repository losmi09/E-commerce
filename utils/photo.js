import catchAsync from './catchAsync.js';
import AppError from './appError.js';
import { sanitizeOutput } from '../controllers/authController.js';
import deleteImage from './deleteImage.js';
import prisma from '../server.js';

const photo = change =>
  catchAsync(async (req, res, next) => {
    console.log(req.file.filename);
    let where = { id: +req.user.id };

    if (req.user.role === 'admin')
      where = { id: +req.params.id || +req.user.id };

    if (req.params.id !== 'me' && req.user.role !== 'admin')
      return next(
        new AppError(
          `You can only ${
            change === 'add' ? 'add a photo to' : 'remove a photo from'
          } your profile`,
          403
        )
      );

    if (change === 'add' && !req.file)
      return next(new AppError('Please upload an image', 400));

    const imageName = change === 'add' ? req.file.filename : 'default.jpg';

    let user = await prisma.user.findUnique({
      where,
    });

    if (!user) return next(new AppError('No user found with that ID', 404));

    if (user.photo !== 'default.jpg') deleteImage('users', user.photo);

    user = await prisma.user.update({
      where,
      data: { photo: imageName },
    });

    sanitizeOutput(user);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });

export default photo;
