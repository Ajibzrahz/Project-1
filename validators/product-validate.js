import Joi from "joi";

const createProductValidation = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.min": "name must exceed 3 character",
    "string.max": "name must not exceed 255 character",
    "any.required": "name is required",
  }),
  description: Joi.string().min(5).max(1500).required().messages({
    "string.min": "description must exceed 5 character",
    "string.max": "description must not exceed 1500 character",
    "any.required": "description is required",
  }),
  price: Joi.number().required().messages({
    "number.base": "price must be a number",
    "any.required": "price is required",
  }),
  inventory: Joi.number().required().messages({
    "number.base": "inventory must be a number",
    "any.required": "inventory is required",
  }),
  brand: Joi.string().required().messages({
    "any.required": "brand is required",
  }),
  images: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.uri": "images must be a valid url",
      })
    )
    .messages({
      "array.base": "images must be an array",
    }),
  category: Joi.string().length(24).hex().required().messages({
    "string.hex": "must be a valid ObjectId",
    "any.required": "category is required",
  }),
});
const updateProductValidation = Joi.object({
  name: Joi.string().min(3).max(255).messages({
    "string.min": "name must exceed 3 character",
    "string.max": "name must not exceed 255 character",
  }),
  description: Joi.string().min(5).max(1500).messages({
    "string.min": "description must exceed 5 character",
    "string.max": "description must not exceed 1500 character",
  }),
  price: Joi.number().messages({
    "number.base": "price must be a number",
  }),
  inventory: Joi.number().messages({
    "number.base": "inventory must be a number",
  }),
  brand: Joi.string().messages({
    "string.base": "brand should be a string",
  }),
  images: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.uri": "images must be a valid url",
      })
    )
    .messages({
      "array.base": "images must be an array",
    }),
  category: Joi.string().length(24).hex().messages({
    "string.hex": "must be a valid ObjectId",
  }),
});
export { createProductValidation, updateProductValidation };
