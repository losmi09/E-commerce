import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authMiddleware from '../middlewares/auth.js';
import checkIfReviewBelongsToUser from '../middlewares/reviewBelonging.js';
import isIdNumber from '../middlewares/isIdNumber.js';

export const router = Router({ mergeParams: true });

router.use(authMiddleware.protect);

router
  .route('/')
  .get(isIdNumber, reviewController.getAllReviews)
  .post(authMiddleware.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(isIdNumber, reviewController.getReview)
  .patch(
    isIdNumber,
    checkIfReviewBelongsToUser('update'),
    reviewController.updateReview
  )
  .delete(
    isIdNumber,
    checkIfReviewBelongsToUser('delete'),
    reviewController.deleteReview
  );
