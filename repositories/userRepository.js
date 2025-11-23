import prisma from '../server.js';

export const findUserById = async id =>
  await prisma.user.findUnique({ where: { id } });

export const findUserByEmail = async email =>
  await prisma.user.findUnique({ where: { email } });

export const updateUser = async (userId, data) =>
  await prisma.user.update({
    where: { id: userId },
    data: { ...data },
  });

export const deleteUser = async userId =>
  await prisma.user.delete({
    where: { id: userId },
  });

export const deactivateUser = async userId =>
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

export const createUser = async ({ firstName, lastName, email, password }) => {
  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      role: 'user',
    },
  });
};

export const findUserByToken = async (token, field) => {
  let where;

  if (field === 'email') where = { emailVerificationToken: token };

  if (field === 'password') where = { passwordResetToken: token };

  return await prisma.user.findFirst({ where });
};

export const setUserToken = async (field, token, userId) => {
  const TOKEN_EXPIRY = Date.now() + 60 * 60 * 1000; // 1 hour

  const fields = {
    password: {
      passwordResetToken: token,
      passwordResetTokenExpiry: new Date(TOKEN_EXPIRY),
    },
    email: {
      emailVerificationToken: token,
      emailVerificationTokenExpiry: new Date(TOKEN_EXPIRY),
    },
  };

  await prisma.user.update({
    where: { id: userId },
    data: fields[field],
  });
};

export const cleanUserToken = async (email, type) => {
  const clean =
    type === 'email'
      ? { emailVerificationToken: null, emailVerificationTokenExpiry: null }
      : { passwordResetToken: null, passwordResetTokenExpiry: null };

  await prisma.user.update({
    where: { email },
    data: clean,
  });
};

export const setUserVerified = async id =>
  await prisma.user.update({
    where: { id },
    data: {
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    },
  });

export const updateUserPassword = async ({ userId, token, hashedPassword }) => {
  const where = userId ? { id: userId } : { passwordResetToken: token };

  return await prisma.user.updateMany({
    where,
    data: {
      password: hashedPassword,
      // JWT has to be issued after password change
      passwordChangedAt: new Date(Date.now() - 1000),
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  });
};
