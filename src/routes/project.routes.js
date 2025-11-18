import { Router } from "express";
import { roleGuard } from "../middleware/roleGuard.middleware.js";
import { verifyToken } from "../middleware/auth.midlleware.js";
import { validate } from "../validations/validation.js";
import { createProject, getAllProjects,getProjectById,updateProject,deleteProjectById  } from "../controller/projects.controller.js";
import { ProjectSchema,ProjectUpdateSchema } from "../validations/project.validation.js";

const router = Router()

router.post("/create", validate(ProjectSchema,'body'), verifyToken, roleGuard('manager'), createProject)

router.get("/getAll", verifyToken, roleGuard('admin','manager'), getAllProjects)

router.get("/getById/:id",verifyToken, roleGuard('admin','manager'), getProjectById)

router.put("/update/:id", validate(ProjectUpdateSchema, 'body'), verifyToken, roleGuard('admin','manager'), updateProject)

router.delete("/delete/:id", verifyToken, roleGuard('admin','manager'), deleteProjectById)

export default router;