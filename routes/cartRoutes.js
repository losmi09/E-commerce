import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import * as authMiddleware from '../middlewares/auth.js';
import isIdNumber from '../middlewares/isIdNumber.js';

export const router = Router();

router.use(authMiddleware.protect);

router
  .route('/items')
  .get(cartController.getCartItems)
  .post(cartController.addToCart);

router
  .route('/items/:productId')
  .get(isIdNumber, cartController.getCartItem)
  .delete(isIdNumber, cartController.removeFromCart);
