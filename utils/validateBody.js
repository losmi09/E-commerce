import productSchema from '../schemas-validation/productSchema.js';
import categorySchema from '../schemas-validation/categorySchema.js';
import cartItemSchema from '../schemas-validation/cartItemSchema.js';
import reviewSchema from '../schemas-validation/reviewSchema.js';

const validateBody = (model, reqBody) => {
  let validation;

  if (model === 'product')
    validation = productSchema.validate(reqBody, { abortEarly: false });

  if (model === 'category')
    validation = categorySchema.validate(reqBody, { abortEarly: false });

  if (model === 'Cart_Item')
    validation = cartItemSchema.validate(reqBody, { abortEarly: false });

  if (model === 'review')
    validation = reviewSchema.validate(reqBody, { abortEarly: false });

  const { error, value } = validation;

  return { error, value };
};

export default validateBody;
