import { Router } from 'express';
import { router as reviewRouter } from './reviewRoutes.js';
import * as productController from '../controllers/productController.js';
import * as authMiddleware from '../middlewares/auth.js';
import isIdNumber from '../middlewares/isIdNumber.js';
import { cacheAll, cacheOne } from '../middlewares/caching.js';

export const router = Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(cacheAll('product'), productController.getAllProducts)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productController.createProduct
  );

router
  .route('/:id')
  .get(isIdNumber, cacheOne('product'), productController.getProduct)
  .patch(
    isIdNumber,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productController.uploadProductImages,
    productController.resizeProductImage,
    productController.updateProduct
  )
  .delete(
    isIdNumber,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productController.deleteProduct
  );
