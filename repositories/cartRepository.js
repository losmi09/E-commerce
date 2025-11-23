import prisma from '../server.js';

export const getUserCartId = async userId => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  return cart.id;
};

export const deleteUserCart = async userId =>
  await prisma.cart.delete({
    where: { userId },
  });

export const createUsersCart = userId =>
  prisma.cart.create({ data: { userId } });
