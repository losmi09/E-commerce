import nodemailer from 'nodemailer';

const getEmailUrl = (path, token) =>
  `http://${process.env.HOST}/api/v1/auth/${path}/${token}`;

export const sendEmail = async options => {
  const { to, subject, text } = options;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'John Smith <john@hotmail.com>',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

export const preparePasswordResetEmail = async resetToken => {
  const resetUrl = getEmailUrl('resetPassword', resetToken);

  const subject = 'Reset your password';

  const text = `Submit a PATCH request to this url to reset your password: ${resetUrl}.`;

  return { subject, text };
};

export const sendEmailVerification = async (user, emailVerificationToken) => {
  const verificationUrl = getEmailUrl('verifyEmail', emailVerificationToken);

  const subject = 'Verify your email';

  const text = `Verify your email by opening this link: ${verificationUrl}.`;

  await sendEmail({
    to: user.email,
    subject,
    text,
  });
};
