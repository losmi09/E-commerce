import * as factory from './handlerFactory.js';

export const getCart = factory.getOne('cart');
export const addToCart = factory.createOne('Cart_Item');
