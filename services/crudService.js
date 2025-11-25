import addFieldsToReqBody from '../utils/request/addFieldsToReqBody.js';
import * as crudRepository from '../repositories/crudRepository.js';
import * as reviewService from './reviewService.js';
import * as categoryService from './categoryService.js';
import AppError from '../utils/error/appError.js';
import sanitizeOutput from '../utils/sanitizeOutput.js';

const calcStatsOnRelatedDocs = async (model, productId, categoryId) => {
  if (model === 'review') await reviewService.calcReviewStats(productId);
  if (model === 'product')
    await categoryService.calcProdsOnCategory(categoryId);
};

export const createOne = async ({ model, data, productId, userId, cartId }) => {
  await addFieldsToReqBody({ model, data, cartId, productId, userId });

  const newDoc = await crudRepository.createDocument(model, data);

  await calcStatsOnRelatedDocs(model, +productId, data.categoryId);

  return newDoc;
};

export const updateOne = async (model, params, data) => {
  const updatedDoc = await crudRepository.updateDocument(
    model,
    +params.id,
    data
  );

  await calcStatsOnRelatedDocs(model, +params.productId);

  if (model === 'user') sanitizeOutput(updatedDoc);

  return updatedDoc;
};

export const deleteOne = async ({ model, id, productId, cartId }) => {
  const doc = await crudRepository.findUniqueDocument({
    model,
    id: +id,
    productId: +productId,
    cartId,
  });

  if (!doc) throw new AppError(`No ${model} found with that ID`, 404);

  await crudRepository.deleteDocument({
    model,
    id: +id,
    productId: +productId,
    cartId,
  });

  await calcStatsOnRelatedDocs(model, +productId, doc.categoryId);
};
