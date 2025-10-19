import * as factory from './handlerFactory.js';

export const getAllCategories = factory.getAll('category', 'id');
export const getCategory = factory.getOne('category');
export const createCategory = factory.createOne('category');
export const updateCategory = factory.updateOne('category');
