import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import * as authMiddleware from '../middlewares/auth.js';
import isIdNumber from '../middlewares/isIdNumber.js';
import { cacheAll, cacheOne } from '../middlewares/caching.js';

export const router = Router();

router
  .route('/')
  .get(cacheAll('category'), categoryController.getAllCategories)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authMiddleware.protect);

router
  .route('/:id')
  .get(isIdNumber, cacheOne('category'), categoryController.getCategory)
  .patch(
    isIdNumber,
    authMiddleware.restrictTo('admin'),
    categoryController.uploadCategoryImage,
    categoryController.resizeCategoryImage,
    categoryController.updateCategory
  )
  .delete(
    isIdNumber,
    authMiddleware.restrictTo('admin'),
    categoryController.deleteCategory
  );
