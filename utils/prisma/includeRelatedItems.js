// Include related items and omit unnecessary fields when necessary
const includeRelatedItems = (model, id = null) => {
  if (model === 'product' && id)
    return {
      reviews: { omit: { productId: true } },
      images: { omit: { productId: true } },
    };

  if (model === 'category' && id) return { products: true };

  if (model === 'cartItem') return { product: true };

  if (model === 'review')
    return {
      user: {
        select: { firstName: true, lastName: true, image: true },
      },
    };

  return {};
};

export default includeRelatedItems;
