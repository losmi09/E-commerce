import addFieldsToReqBody from '../utils/request/addFieldsToReqBody.js';
import * as crudRepository from '../repositories/crudRepository.js';
import * as reviewService from './reviewService.js';
import * as categoryService from './categoryService.js';
import AppError from '../utils/error/appError.js';
import sanitizeOutput from '../utils/sanitizeOutput.js';
import { reCache } from '../middlewares/caching.js';

const calcStatsOnRelatedDocs = async (model, productId, categoryId) => {
  if (model === 'review') await reviewService.calcReviewStats(productId);
  if (model === 'product' && categoryId)
    await categoryService.calcProdsOnCategory(categoryId);
};

export const createOne = async ({ model, data, productId, userId, cartId }) => {
  await addFieldsToReqBody({ model, data, cartId, productId, userId });

  const newDoc = await crudRepository.createDocument(model, data);

  if (model === 'product' || model === 'category' || model === 'review')
    await reCache(model, newDoc.id);

  await calcStatsOnRelatedDocs(model, productId, data.categoryId);

  return newDoc;
};

export const updateOne = async (model, params, data) => {
  const updatedDoc = await crudRepository.updateDocument(
    model,
    Number(params.id),
    data
  );

  if (model === 'product' || model === 'category' || model === 'review')
    await reCache(model, updatedDoc.id);

  await calcStatsOnRelatedDocs(model, Number(params.productId));

  if (model === 'user') sanitizeOutput(updatedDoc);

  return updatedDoc;
};

export const deleteOne = async ({ model, id, productId, cartId }) => {
  const doc = await crudRepository.findUniqueDocument({
    model,
    id,
    productId,
    cartId,
  });

  if (!doc) throw new AppError(`No ${model} found with that ID`, 404);

  await crudRepository.deleteDocument({
    model,
    id,
    productId,
    cartId,
  });

  if (model === 'product' || model === 'category' || model === 'review')
    await reCache(model, doc.id);

  await calcStatsOnRelatedDocs(model, productId, doc.categoryId);
};
