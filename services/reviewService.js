import prisma from '../server.js';

export const calcReviewStats = async productId => {
  const stats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: {
      productId,
    },
  });

  const average = stats._avg.rating;
  const count = stats._count.rating;

  await prisma.product.update({
    where: { id: productId },
    data: {
      reviewsAverage: Math.round(average * 100) / 100,
      reviewsCount: Math.round(count * 100) / 100,
    },
  });

  return { average, count };
};
