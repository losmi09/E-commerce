import pluralize from 'pluralize';
import catchAsync from '../utils/catchAsync.js';
import sendData from '../utils/response/sendData.js';
import * as crudRepository from '../repositories/crudRepository.js';
import { client } from '../server.js';
import AppError from '../utils/error/appError.js';

export const reCache = async (model, id) => {
  if (model === 'review') client.del(`products:${id}`);
  else {
    client.del(`${pluralize(model)}:all`);
    client.del(`${model}:${id}`);
  }
};

export const cacheAll = model =>
  catchAsync(async (req, res, next) => {
    const cachedDocs = await client.get(`${pluralize(model)}:all`);

    if (cachedDocs && Object.keys(req.query).length === 0)
      return sendData(res, JSON.parse(cachedDocs), model);

    const docs = await crudRepository.findManyDocuments(model);

    client.set(`${pluralize(model)}:all`, JSON.stringify(docs), { EX: 60 });

    next();
  });

export const cacheOne = model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const cachedDoc = await client.get(`${model}:${id}`);

    // Can be both cases
    if (cachedDoc !== null && cachedDoc !== 'null')
      return sendData(res, JSON.parse(cachedDoc), model);

    const doc = await crudRepository.findUniqueDocument({
      model,
      id: Number(id),
    });

    if (!doc) return next(new AppError(`No ${model} found with that ID`, 404));

    client.set(`${model}:${id}`, JSON.stringify(doc), { EX: 60 });

    next();
  });
