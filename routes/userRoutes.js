import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
import isIdNumber from '../utils/isIdNumber.js';

export const router = Router();

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.updateMe);

router.patch('/deactivateMe', userController.deactivateMe);

router.delete('/deleteMe', userController.deleteMe);

router
  .route('/:id/photo')
  .get(userController.getUsersPhoto)
  .post(
    isIdNumber,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.addUsersPhoto
  )
  .patch(isIdNumber, userController.removeUsersPhoto);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);

router
  .route('/:id')
  .get(isIdNumber, userController.getUser)
  .delete(isIdNumber, userController.deleteUser);
