import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  price: Joi.number().positive().required(),
  image: Joi.string().trim(),
  categoryId: Joi.number().integer().positive().required(),
});

export default productSchema;
