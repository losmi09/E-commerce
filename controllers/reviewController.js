import * as crudController from './crudController.js';

export const getAllReviews = crudController.getAll('review');
export const getReview = crudController.getOne('review');
export const createReview = crudController.createOne('review');
export const updateReview = crudController.updateOne('review');
export const deleteReview = crudController.deleteOne('review');
