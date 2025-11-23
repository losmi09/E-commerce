// Omit unnecessary fields from response data
const omitFields = model => {
  if (model === 'cartItem') return { cartId: true, productId: true };
  if (model === 'review') return { productId: true };

  return {};
};

export default omitFields;
