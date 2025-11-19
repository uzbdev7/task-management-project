import { Router } from 'express';
import {
  getAllUsers,
  updateUser,
  getUserById,
  deleteUserById,
} from '../controller/user.controller.js';
import { verifyToken } from '../middleware/auth.midlleware.js';
import { roleGuard } from '../middleware/roleGuard.middleware.js';
import { validate } from '../validations/validation.js';
import { UserUpdateSchema } from '../validations/auth.validation.js';

const router = Router();

router.get('/getAll', verifyToken, roleGuard('admin', 'user', 'manager'), getAllUsers);

router.get('/getById/:id', verifyToken, roleGuard('admin', 'manager'), getUserById);

router.put(
  '/update/:id',
  validate(UserUpdateSchema, 'body'),
  verifyToken,
  roleGuard('admin'),
  updateUser,
);

router.delete('/delete/:id', verifyToken, roleGuard('admin'), deleteUserById);

export default router;
