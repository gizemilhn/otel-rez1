import Joi from 'joi';

// Register Schema
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  ad: Joi.string().required(),
  soyad: Joi.string().required(),
  telefon: Joi.string().required(),
});

// Login Schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
