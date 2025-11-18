import Joi from "joi";

export const ProjectSchema = Joi.object({
    name:Joi.string().min(6).max(50).required(),
    description:Joi.string().min(10).max(100).required(),
    status:Joi.string().valid('active','completed','archived').default('active')
})

export const ProjectUpdateSchema = Joi.object({
    name:Joi.string().min(6).max(50).optional(),
    description:Joi.string().min(10).max(100).optional(),
    status:Joi.string().valid('active','completed','archived').optional()
})


