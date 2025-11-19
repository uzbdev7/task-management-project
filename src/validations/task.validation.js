import Joi from 'joi';

export const TaskSchema = Joi.object({
  title: Joi.string().min(10).max(100).required(),
  description: Joi.string().min(10).max(100).required(),
  status: Joi.string().valid('pending', 'in progress', 'completed', 'archived'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  due_date: Joi.string().required(),
  assigned_to: Joi.string().uuid().required(),
  project_id: Joi.string().uuid().required(),
});

export const TaskSchemaUpdate = Joi.object({
  title: Joi.string().min(10).max(100).optional(),
  description: Joi.string().min(10).max(100).optional(),
  status: Joi.string().valid('pending', 'in progress', 'completed', 'archived'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  due_date: Joi.string().optional(),
  assigned_to: Joi.string().uuid().optional(),
  project_id: Joi.string().uuid().optional(),
});

export const assignUserToTaskSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
});
