import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';
import checkIfReviewBelongsToUser from '../utils/reviewBelonging.js';

export const router = Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(checkIfReviewBelongsToUser('update'), reviewController.updateReview)
  .delete(checkIfReviewBelongsToUser('delete'), reviewController.deleteReview);
