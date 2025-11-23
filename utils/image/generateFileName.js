const generateFileName = (model, id, cover = false, index) => {
  const timestamp = Date.now();

  if (model === 'product')
    return cover
      ? `product-${id}-${timestamp}-cover.jpg`
      : `product-${id}-${timestamp}-${index + 1}.jpg`;

  return `${model}-${id}-${timestamp}.jpg`;
};

export default generateFileName;
