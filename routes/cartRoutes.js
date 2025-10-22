import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import * as authController from '../controllers/authController.js';

export const router = Router();

router.use(authController.protect);

router
  .route('/items')
  .get(cartController.getCartItems)
  .post(cartController.addToCart);

router
  .route('/items/:productId')
  .get(cartController.getCartItem)
  .delete(cartController.removeFromCart);
