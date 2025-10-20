import pluralize from 'pluralize';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import filterAndSort from '../utils/filtering-sorting.js';
import productSchema from '../schemas-validation/productSchema.js';
import categorySchema from '../schemas-validation/categorySchema.js';
import { sanitizeOutput } from './authController.js';
import prisma from '../server.js';

export const getAll = (model, defaultSort) =>
  catchAsync(async (req, res, next) => {
    try {
      const modelNamePlural = pluralize(model);

      const { skip, limit, query, sorting } = filterAndSort(
        req.query,
        defaultSort
      );

      const doc = await prisma[model].findMany({
        skip,
        take: +limit,
        where: {
          ...query,
        },
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

    if (model === 'category') include = { products: true };

    const doc = await prisma[model].findUnique({
      where: {
        id: +req.params.id,
      },
      include,
    });

    if (!doc) return next(new AppError(`No ${model} found with that ID`, 404));

    if (model === 'user') sanitizeOutput(doc);

    res.status(200).json({
      status: 'success',
      data: {
        [model]: doc,
      },
    });
  });

const validateBody = (model, reqBody) => {
  let validation;

  if (model === 'product')
    validation = productSchema.validate(reqBody, { abortEarly: false });

  if (model === 'category')
    validation = categorySchema.validate(reqBody, { abortEarly: false });

  const { error, value } = validation;

  return { error, value };
};

export const createOne = model =>
  catchAsync(async (req, res, next) => {
    const { error, value } = validateBody(model, req.body);

    const camelToSnakeCase = str =>
      str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    const values = Object.values(value);

    const snakeCaseKeys = Object.keys(value).map(key => camelToSnakeCase(key));

    const newValue = {};

    snakeCaseKeys.forEach((key, i) => {
      newValue[key] = values[i];
    });

    if (error) {
      const errorMessage = error.details[0].message.replaceAll('"', '');
      return next(new AppError(errorMessage, 400));
    }

    const newDoc = await prisma[model].create({
      data: newValue,
    });

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

    res.status(200).json({
      status: 'success',
      data: {
        [model]: updatedDoc,
      },
    });
  });

export const deleteOne = model =>
  catchAsync(async (req, res) => {
    await prisma[model].delete({
      where: {
        id: +req.params.id,
      },
    });

    res.status(204).end();
  });
