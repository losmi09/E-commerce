import prisma from '../server.js';

export const calcProdsOnCategory = async categoryId => {
  const { _count: productsCount } = await prisma.product.aggregate({
    where: { categoryId },
    _count: true,
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: { productsCount },
  });
};
