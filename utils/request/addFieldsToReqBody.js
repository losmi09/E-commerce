// Instead of having to enter productId and userId in req.body when adding a review to the product or when adding an item to the cart it does this ⬇️ (value is the object that validation returns)
const addFieldsToReqBody = async ({
  model,
  data,
  productId,
  userId,
  cartId,
}) => {
  if (model === 'cartItem') data.cartId = cartId;
  if (model === 'review') {
    data.productId = +productId;
    data.userId = userId;
  }
};

export default addFieldsToReqBody;
