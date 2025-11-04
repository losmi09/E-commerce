import prisma from '../server.js';

const calcProdsOnCategory = async categoryId => {
  const aggregation = await prisma.product.aggregate({
    where: { categoryId },
    _count: true,
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: { productsCount: aggregation._count },
  });
};

export default calcProdsOnCategory;
