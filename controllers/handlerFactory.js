import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error/appError.js';
import validateBody from '../utils/validation/validateBody.js';
import prepareQueryForUser from '../utils/query/prepareQueryForUser.js';
import sendData from '../utils/response/sendData.js';
import throwErrorMessage from '../utils/error/throwErrorMessage.js';
import * as crudRepository from '../repositories/crudRepository.js';
import * as crudService from '../services/crudService.js';
import * as reviewService from '../services/reviewService.js';

export const getAll = model =>
  catchAsync(async (req, res) => {
    const cartId = req.user ? req.user.cartId : undefined;

    // Add params to req.query so user can get only items in HIS cart or only reviews that BELONG to the product
    const query = await prepareQueryForUser({
      model,
      query: req.query,
      productId: req.params.productId,
      cartId,
    });

    const doc = await crudRepository.findManyDocuments(model, query);

    sendData(res, doc, model);
  });

export const getOne = model =>
  catchAsync(async (req, res, next) => {
    const { id, productId } = req.params;

    const cartId = req.user ? req.user.cartId : undefined;

    const doc = await crudRepository.findUniqueDocument({
      model,
      id: +id,
      productId: +productId,
      cartId,
    });

    if (!doc) return next(new AppError(`No ${model} found with that ID`, 404));

    sendData(res, doc, model);
  });

export const createOne = model =>
  catchAsync(async (req, res) => {
    const { error, value } = validateBody(model, req.body);

    if (error) throwErrorMessage(error);

    const newDoc = await crudService.createOne({
      model,
      data: value,
      productId: req.params.productId,
      userId: req.user.id,
      cartId: req.user.cartId,
    });

    sendData(res, newDoc, model, 201);
  });

export const updateOne = model =>
  catchAsync(async (req, res) => {
    const { error, value } = validateBody(model, req.body);

    if (error) throwErrorMessage(error, 'updating');

    const updatedDoc = await crudService.updateOne(model, req.params, value);

    sendData(res, updatedDoc, model);
  });

export const deleteOne = model =>
  catchAsync(async (req, res, next) => {
    const { id, productId } = req.params;

    const { cartId } = req.user;

    const doc = await crudRepository.findUniqueDocument({
      model,
      id: +id,
      productId: +productId,
      cartId,
    });

    if (!doc) return next(new AppError(`No ${model} found with that ID`, 404));

    await crudRepository.deleteDocument({
      model,
      id: +id,
      productId: +productId,
      cartId,
    });

    if (model === 'review')
      reviewService.calcReviewStats(+req.params.productId);

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

    res.status(204).end();
  });
