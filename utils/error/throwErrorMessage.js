import AppError from './appError.js';

const throwErrorMessage = (error, type = 'creating') => {
  // Return error message from first validation-error object
  let errorMessage = error.details[0].message.replaceAll('"', '');

  // If modifications are applying it doesn't make sense that any field is required
  if (type === 'updating')
    errorMessage = error.details
      .find(errObj => !errObj.message.endsWith('required'))
      ?.message.replaceAll('"', '');

  if (errorMessage) throw new AppError(errorMessage, 400);
};

export default throwErrorMessage;
