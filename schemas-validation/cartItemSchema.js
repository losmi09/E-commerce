import Joi from 'joi';

const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

export default cartItemSchema;
