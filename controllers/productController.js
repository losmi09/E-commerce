import * as factory from './handlerFactory.js';

export const getAllProducts = factory.getAll('product', 'price');
export const getProduct = factory.getOne('product');
export const createProduct = factory.createOne('product');
export const updateProduct = factory.updateOne('product');
export const deleteProduct = factory.deleteOne('product');
