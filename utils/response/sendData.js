import pluralize from 'pluralize';
import sanitizeOutput from '../sanitizeOutput.js';

const prepareData = (data, model) => {
  if (model === 'user') {
    if (Array.isArray(data)) data.forEach(user => sanitizeOutput(user));
    else sanitizeOutput(data);
  }

  return data;
};

const sendData = (res, data, model, statusCode = 200) => {
  // Sanitize sensitive data if model is user
  prepareData(data, model);

  const field = data.constructor === Array ? pluralize(model) : model;

  res.status(statusCode).json({
    status: 'success',
    results: data.length, //
    data: {
      [field]: data,
    },
  });
};

export default sendData;
