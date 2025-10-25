import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../utils/isIdNumber.js';

export const router = Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authController.protect);

router
  .route('/:id')
  .get(isIdNumber, categoryController.getCategory)
  .patch(
    isIdNumber,
    authController.restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    isIdNumber,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );
