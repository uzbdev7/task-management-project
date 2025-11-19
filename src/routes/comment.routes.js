import Router from 'express';
import {
  createComment,
  getAllTasks,
  getCommentById,
  updateComment,
  deleteCommentById,
} from '../controller/comments.controller.js';
import { validate } from '../validations/validation.js';
import { commentSchema, commentSchemaUpdate } from '../validations/comment.validation.js';
import { verifyToken } from '../middleware/auth.midlleware.js';
import { roleGuard } from '../middleware/roleGuard.middleware.js';

const router = Router();

router.post(
  '/create',
  validate(commentSchema, 'body'),
  verifyToken,
  roleGuard('manager', 'user'),
  createComment,
);

router.get('/getAll', verifyToken, roleGuard('admin', 'manager', 'user'), getAllTasks);

router.get('/getById/:id', verifyToken, roleGuard('admin', 'manager', 'user'), getCommentById);

router.put('/update/:id', validate(commentSchemaUpdate, 'body'), updateComment);

router.delete('/delete/:id', verifyToken, roleGuard('admin', 'manager', 'user'), deleteCommentById);

export default router;
