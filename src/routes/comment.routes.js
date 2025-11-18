import Router from "express"
import { createComment } from "../controller/comments.controller.js"
import { validate } from "../validations/validation.js"
import { commentSchema } from "../validations/comment.validation.js"
import { verifyToken } from "../middleware/auth.midlleware.js"
import { roleGuard } from "../middleware/roleGuard.middleware.js"

const router = Router()

router.post("/create", validate(commentSchema, 'body'), verifyToken, roleGuard('manager','user'), createComment)

export default router;
