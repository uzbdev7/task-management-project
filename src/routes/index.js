import { Router } from 'express';
import adminRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import projectRouter from './project.routes.js';
import taskRouter from './task.routes.js';
import commentRouter from './comment.routes.js';
const router = Router();

router.use('/auth', adminRouter);
router.use('/users', userRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/comments', commentRouter);

export default router;
