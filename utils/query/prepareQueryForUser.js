// Add necessary params to req.query so user can get only his items in the cart or only reviews that belong to the product whose id is in req.params
const prepareQueryForUser = async ({ model, query, productId, cartId }) => {
  const queryClone = structuredClone(query);

  if (model === 'cartItem') queryClone.cartId = cartId;
  if (model === 'review') queryClone.productId = productId;

  return queryClone;
};

export default prepareQueryForUser;
