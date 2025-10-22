import Joi from 'joi';

const reviewSchema = Joi.object({
  text: Joi.string().required().trim(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

export default reviewSchema;
