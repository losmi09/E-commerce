import prepareQuery from '../utils/query/prepareQuery.js';
import whereClause from '../utils/prisma/whereClause.js';
import includeRelatedItems from '../utils/prisma/includeRelatedItems.js';
import omitFields from '../utils/prisma/omitFields.js';
import prisma from '../server.js';

export const findManyDocuments = async (model, query = {}) => {
  const queryClone = structuredClone(query);

  // Mutates queryClone (safe)
  const { skip, limit, orderBy } = prepareQuery(queryClone, model);

  return await prisma[model].findMany({
    skip,
    take: +limit,
    where: queryClone,
    include: includeRelatedItems(model),
    orderBy,
    omit: omitFields(model),
  });
};

export const findUniqueDocument = async ({ model, id, productId, cartId }) =>
  await prisma[model].findUnique({
    where: await whereClause({ model, id, productId, cartId }),
    include: includeRelatedItems(model, id),
    omit: omitFields(model),
  });

export const createDocument = async (model, data) =>
  await prisma[model].create({ data });

export const updateDocument = async (model, id, data) =>
  await prisma[model].update({
    where: { id },
    data: { ...data },
  });

export const deleteDocument = async ({ model, id, productId, cartId }) =>
  await prisma[model].delete({
    where: await whereClause({ model, id, productId, cartId }),
  });
