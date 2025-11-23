const sanitizeOutput = user => {
  const fields = [
    'password',
    'passwordChangedAt',
    'passwordResetToken',
    'passwordResetTokenExpiry',
    'emailVerificationToken',
    'emailVerificationTokenExpiry',
    'isVerified',
    'isActive',
  ];

  fields.forEach(field => (user[field] = undefined));
};

export default sanitizeOutput;
