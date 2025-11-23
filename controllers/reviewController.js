import * as factory from './handlerFactory.js';

export const getAllReviews = factory.getAll('review');
export const getReview = factory.getOne('review');
export const createReview = factory.createOne('review');
export const updateReview = factory.updateOne('review');
export const deleteReview = factory.deleteOne('review');
