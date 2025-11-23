import addFieldsToReqBody from '../utils/request/addFieldsToReqBody.js';
import * as crudRepository from '../repositories/crudRepository.js';
import * as reviewService from './reviewService.js';
import * as categoryService from './categoryService.js';
import AppError from '../utils/error/appError.js';
import sanitizeOutput from '../utils/sanitizeOutput.js';

export const createOne = async ({ model, data, productId, userId, cartId }) => {
  await addFieldsToReqBody({ model, data, cartId, productId, userId });

  const newDoc = await crudRepository.createDocument(model, data);

  if (model === 'review') reviewService.calcReviewStats(+productId);

  if (model === 'product') categoryService.calcProdsOnCategory(data.categoryId);

  return newDoc;
};

export const updateOne = async (model, params, data) => {
  const updatedDoc = await crudRepository.updateDocument(
    model,
    +params.id,
    data
  );

  if (model === 'review') reviewService.calcReviewStats(+params.productId);

  if (model === 'user') sanitizeOutput(updatedDoc);

  return updatedDoc;
};

export const deleteOne = async ({ model, id, productId, cartId }) => {
  const doc = await crudRepository.findUniqueDocument(
    model,
    id,
    productId,
    cartId
  );

  if (!doc) throw new AppError(`No ${model} found with that ID`, 404);

  await crudRepository.deleteDocument({ model, id, productId, cartId });

  if (model === 'review') reviewService.calcReviewStats(+productId);

  if (model === 'product') categoryService.calcProdsOnCategory(doc.categoryId);

  // if (model === 'user' || model === 'category')
  //   deleteImage(pluralize(model), doc.image);

  // if (model === 'product') {
  //   const productImages = await prisma.productImage.findMany({
  //     where: { productId: doc.id },
  //   });
  //   deleteImage('products', doc.coverImage);
  //   productImages.forEach(img => deleteImage('products', img.fileName));
  //   calcProdsOnCategory(doc.categoryId);
  // }
};
