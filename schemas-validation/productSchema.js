import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  price: Joi.number().positive().required(),
  coverImage: Joi.string().trim(),
  images: Joi.string().trim(),
  categoryId: Joi.number().integer().positive().required(),
});

export default productSchema;
