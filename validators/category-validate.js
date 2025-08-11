import Joi from "joi";

const categoryValidate = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "name must be a string",
    "string.min": "name must be more than 2",
    "string.max": "name must be less than 50",
    "any.required": "name is required",
  }),
  description: Joi.string().min(3).max(255).messages({
    "string.base": "name must be a string",
    "string.min": "name must be more than 2",
    "string.max": "name must be less than 255",
  }),
});

export default categoryValidate;
