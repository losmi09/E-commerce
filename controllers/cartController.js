import * as factory from './handlerFactory.js';

export const getCartItems = factory.getAll('Cart_Item', 'cart_id');
export const getCartItem = factory.getOne('Cart_Item');
export const addToCart = factory.createOne('Cart_Item');
export const removeFromCart = factory.deleteOne('Cart_Item');
