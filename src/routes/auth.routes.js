import { Router } from 'express';
import {
  signUp,
  login,
  verifyOtp,
  getMe,
  logout,
  refreshToken,
} from '../controller/auth.controller.js';
import { verifyToken } from '../middleware/auth.midlleware.js';
import { validate } from '../validations/validation.js';
import { registerSchema, loginSchema, otpSchema } from '../validations/auth.validation.js';

const router = Router();

router.post('/signUp', validate(registerSchema, 'body'), signUp);

router.post('/verify', validate(otpSchema, 'body'), verifyOtp);

router.post('/login', validate(loginSchema, 'body'), login);

router.get('/getMe', verifyToken, getMe);

router.get('/logout', verifyToken, logout);

router.post('/refresh-token', verifyToken, refreshToken);

export default router;
