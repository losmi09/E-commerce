import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  image: Joi.string(),
});

export default categorySchema;
