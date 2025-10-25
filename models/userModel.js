import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../server.js';

export const hashPassword = async password => await bcrypt.hash(password, 12);

export const comparePasswords = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

export const createToken = async (user, field) => {
  const token = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  let setFields;

  if (field === 'password')
    setFields = {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    };

  if (field === 'email')
    setFields = {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    };

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: setFields,
  });

  return token;
};

export const checkForPasswordChange = (JWTTimestamp, passwordChangeTimeStamp) =>
  JWTTimestamp * 1000 <
  new Date(passwordChangeTimeStamp - 2 * 60 * 60 * 1000).getTime();
