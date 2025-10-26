import pluralize from 'pluralize';
import camelcaseKeys from 'camelcase-keys';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import filterAndSort from '../utils/filtering-sorting.js';
import { sanitizeOutput } from './authController.js';
import getUsersCartId from '../utils/getUsersCardId.js';
import calcReviewStats from '../utils/calculateReviews.js';
import validateBody from '../utils/validateBody.js';
import prisma from '../server.js';

export const getAll = (model, defaultSort) =>
  catchAsync(async (req, res, next) => {
    try {
      const modelNamePlural = pluralize(model);

      const { skip, limit, query, sorting } = filterAndSort(
        req.query,
        defaultSort
      );

      let include;

      if (model === 'cartItem') {
        query.cartId = await getUsersCartId(req);
        include = { product: true };
      }

      if (model === 'review') query.productId = +req.params.productId;

      const doc = await prisma[model].findMany({
        skip,
        take: +limit,
        where: {
          ...query,
        },
        include,
        orderBy: sorting,
      });

      if (model === 'user') doc.forEach(user => sanitizeOutput(user));

      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          [modelNamePlural]: doc,
        },
      });
    } catch (err) {
      if (err.message.includes('Unknown argument'))
        return next(new AppError('Bad filter', 400));
    }
  });

export const getOne = model =>
  catchAsync(async (req, res, next) => {
    let include = {};

    if (model === 'product') include = { reviews: true };

    if (model === 'category') include = { products: true };

    let findBy = { id: +req.params.id };

    if (model === 'cartItem') {
      findBy = {
        productId: +req.params.productId,
        cartId: await getUsersCartId(req),
      };

      include = { product: true };
    }

    let [doc] = await prisma[model].findMany({
      where: findBy,
      include,
    });

    if (!doc || doc.length === 0)
      return next(new AppError(`No ${model} found with that ID`, 404));

    if (model === 'user') sanitizeOutput(doc);

    res.status(200).json({
      status: 'success',
      data: {
        [model]: camelcaseKeys(doc),
      },
    });
  });

export const createOne = model =>
  catchAsync(async (req, res, next) => {
    const { error, value } = validateBody(model, req.body);

    if (error) {
      const errorMessage = error.details[0].message.replaceAll('"', '');
      return next(new AppError(errorMessage, 400));
    }

    if (model === 'cartItem') value.cartId = await getUsersCartId(req);

    if (model === 'review') {
      value.productId = +req.params.productId;
      value.userId = req.user.id;
    }

    const newDoc = await prisma[model].create({
      data: value,
    });

    if (model === 'review') calcReviewStats(+req.params.productId);

    res.status(201).json({
      status: 'success',
      data: {
        [model]: newDoc,
      },
    });
  });

export const updateOne = model =>
  catchAsync(async (req, res, next) => {
    const { error, value } = validateBody(model, req.body);

    let errorMessage;

    if (error)
      error.details.forEach(err => {
        if (!err.message.endsWith('required'))
          errorMessage = err.message.replaceAll('"', '');
      });

    if (errorMessage) return next(new AppError(errorMessage, 400));

    const updatedDoc = await prisma[model].update({
      where: {
        id: +req.params.id,
      },
      data: {
        ...value,
      },
    });

    if (model === 'user') sanitizeOutput(updatedDoc);

    if (model === 'review') calcReviewStats(+req.params.productId);

    res.status(200).json({
      status: 'success',
      data: {
        [model]: updatedDoc,
      },
    });
  });

export const deleteOne = model =>
  catchAsync(async (req, res, next) => {
    let deleteBy = { id: +req.params.id };

    if (model === 'cartItem')
      deleteBy = {
        productId: +req.params.productId,
        cartId: await getUsersCartId(req),
      };

    const deleted = await prisma[model].deleteMany({
      where: deleteBy,
    });

    if (deleted.count === 0)
      return next(new AppError(`No ${model} found with that ID`, 404));

    if (model === 'review') calcReviewStats(+req.params.productId);

    res.status(204).end();
  });
