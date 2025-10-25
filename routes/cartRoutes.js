import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../utils/isIdNumber.js';

export const router = Router();

router.use(authController.protect);

router
  .route('/items')
  .get(cartController.getCartItems)
  .post(cartController.addToCart);

router
  .route('/items/:productId')
  .get(isIdNumber, cartController.getCartItem)
  .delete(isIdNumber, cartController.removeFromCart);
