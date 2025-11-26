import Joi from 'joi';

const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive(),
});

export default cartItemSchema;
