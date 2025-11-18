import { Router } from "express";
import { roleGuard } from "../middleware/roleGuard.middleware.js";
import { verifyToken } from "../middleware/auth.midlleware.js";
import { validate } from "../validations/validation.js";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTaskById } from "../controller/tasks.controller.js";
import { TaskSchema , TaskSchemaUpdate} from "../validations/task.validation.js";

const router = Router()

router.post("/create", validate(TaskSchema,'body'), verifyToken, roleGuard('manager'), createTask);

router.get("/getAll", verifyToken, roleGuard('admin','manager'), getAllTasks);

router.get("/getById/:id", verifyToken, roleGuard('admin','manager'), getTaskById);

router.put("/update/:id", validate(TaskSchemaUpdate, 'body'), verifyToken, roleGuard('admin', 'manager'), updateTask);

router.delete("/delete/:id", verifyToken, roleGuard('admin','manager'), deleteTaskById);

export default router;