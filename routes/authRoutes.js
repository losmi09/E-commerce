import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middlewares/auth.js';

export const router = Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

router.patch('/verifyEmail/:token', authController.verifyEmail);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authMiddleware.protect);

router.post('/logout', authController.logout);

router.patch('/me/password', authController.updateCurrentUserPassword);
