import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../middlewares/isIdNumber.js';

export const router = Router();

router.use(authController.protect);

router
  .route('/me')
  .get(userController.getCurrentUser, userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateCurrentUser
  )
  .delete(userController.deleteCurrentUser);

router.patch('/deactivateMe', userController.deactivateCurrentUser);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);

router
  .route('/:id')
  .get(isIdNumber, userController.getUser)
  .delete(isIdNumber, userController.deleteUser);
