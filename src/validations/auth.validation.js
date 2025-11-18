import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(6).max(100).required(),
  password: Joi.string().min(8).max(30).required(),
  role: Joi.string().valid("user", "admin", 'manager').default('user')
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp:Joi.string().required()
})
export const UserUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().min(6).max(100).optional(),
  password: Joi.string().min(8).max(30).optional(),
  role: Joi.string().valid("user", "admin", 'manager').optional()
});