// Route for getting user's cart doesn't include req.params, so if modelName is "cartItem" it fetches items from DB which satisfy this compound index ⬇️
const whereClause = async ({ model, id, productId, cartId }) => {
  if (model === 'cartItem') return { cartId_productId: { productId, cartId } };

  return { id };
};

export default whereClause;
