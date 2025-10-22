import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import * as authController from '../controllers/authController.js';

export const router = Router();

router.use(authController.protect);

router.route('/').get(cartController.getCart).post(cartController.addToCart);
