import * as crudController from './crudController.js';

export const getCartItems = crudController.getAll('cartItem');
export const getCartItem = crudController.getOne('cartItem');
export const addToCart = crudController.createOne('cartItem');
export const removeFromCart = crudController.deleteOne('cartItem');
