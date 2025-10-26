import { Router } from 'express';
import { router as reviewRouter } from './reviewRoutes.js';
import * as productController from '../controllers/productController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../utils/isIdNumber.js';

export const router = Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    productController.uploadProductImage,
    productController.resizeProductImage,
    productController.createProduct
  );

router
  .route('/:id')
  .get(isIdNumber, productController.getProduct)
  .patch(
    isIdNumber,
    authController.protect,
    authController.restrictTo('admin'),
    productController.updateProduct
  )
  .delete(
    isIdNumber,
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );
