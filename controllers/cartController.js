import * as factory from './handlerFactory.js';

export const getCartItems = factory.getAll('cartItem', 'cartId');
export const getCartItem = factory.getOne('cartItem');
export const addToCart = factory.createOne('cartItem');
export const removeFromCart = factory.deleteOne('cartItem');
