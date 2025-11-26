import productSchema from '../../schemas/productSchema.js';
import categorySchema from '../../schemas/categorySchema.js';
import cartItemSchema from '../../schemas/cartItemSchema.js';
import reviewSchema from '../../schemas/reviewSchema.js';

const validateBody = (model, reqBody) => {
  let validation;

  if (model === 'product')
    validation = productSchema.validate(reqBody, { abortEarly: false });

  if (model === 'category')
    validation = categorySchema.validate(reqBody, { abortEarly: false });

  if (model === 'cartItem')
    validation = cartItemSchema.validate(reqBody, { abortEarly: false });

  if (model === 'review')
    validation = reviewSchema.validate(reqBody, { abortEarly: false });

  const { error, value } = validation;

  return { error, value };
};

export default validateBody;
