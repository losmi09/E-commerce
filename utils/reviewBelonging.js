import catchAsync from './catchAsync.js';
import AppError from './appError.js';
import prisma from '../server.js';

const checkIfReviewBelongsToUser = change =>
  catchAsync(async (req, res, next) => {
    const review = await prisma.review.findUnique({
      where: { id: +req.params.id },
    });

    if (!review) return next(new AppError('No review found with that ID', 404));

    if (review.user_id !== req.user.id)
      return next(new AppError(`You can only ${change} your reviews`, 403));

    next();
  });

export default checkIfReviewBelongsToUser;
