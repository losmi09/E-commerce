import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../middlewares/isIdNumber.js';
import { cacheAll, cacheOne } from '../middlewares/caching.js';

export const router = Router();

router
  .route('/')
  .get(cacheAll('category'), categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authController.protect);

router
  .route('/:id')
  .get(isIdNumber, cacheOne('category'), categoryController.getCategory)
  .patch(
    isIdNumber,
    authController.restrictTo('admin'),
    categoryController.uploadCategoryImage,
    categoryController.resizeCategoryImage,
    categoryController.updateCategory
  )
  .delete(
    isIdNumber,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );
