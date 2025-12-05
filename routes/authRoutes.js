import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middlewares/auth.js';

export const router = Router();

router.post('/register', authController.register);
router.post('/signin', authController.signin);

router.patch('/verifyEmail/:token', authController.verifyEmail);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/refreshToken', authController.refreshToken);

router.use(authMiddleware.protect);

router.post('/logout', authController.logout);

router.patch('/me/password', authController.updateCurrentUserPassword);
