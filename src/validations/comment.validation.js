import Joi from 'joi';

export const commentSchema = Joi.object({
  task_id: Joi.string().uuid().required(),
  author_id: Joi.string().uuid().required(),
  content: Joi.string().min(10).max(250).required(),
});

export const commentSchemaUpdate = Joi.object({
  task_id: Joi.string().uuid().optional(),
  author_id: Joi.string().uuid().optional(),
  content: Joi.string().min(10).max(250).optional(),
});
