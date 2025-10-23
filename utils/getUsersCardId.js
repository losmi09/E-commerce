import prisma from '../server.js';

const getUsersCartId = async req => {
  const cart = await prisma.cart.findUnique({
    where: { user_id: req.user.id },
  });

  return cart.id;
};

export default getUsersCartId;
