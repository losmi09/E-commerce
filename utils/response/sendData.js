import pluralize from 'pluralize';
import sanitizeOutput from '../sanitizeOutput.js';

// By default prisma saves some numeric data types as string
const convertToNumbers = data => {
  const toNumber = obj => {
    const newObj = {};

    Object.entries(obj).map(entry => {
      const [key, value] = entry;
      newObj[key] =
        Number.isFinite(Number(value)) && key !== 'createdAt'
          ? Number(value)
          : value;
    });

    return newObj;
  };

  return data.constructor === Array
    ? data.map(data => toNumber(data))
    : toNumber(data);
};

const prepareData = (data, model) => {
  if (model === 'user') {
    if (Array.isArray(data)) data.forEach(user => sanitizeOutput(user));
    else sanitizeOutput(data);
  }

  const readyData = convertToNumbers(data);

  return readyData;
};

const sendData = (res, data, model, statusCode = 200) => {
  // Convert numeric strings to numbers sanitize sensitive data if model is user and
  const readyData = prepareData(data, model);

  const field = data.constructor === Array ? pluralize(model) : model;

  res.status(statusCode).json({
    status: 'success',
    results: readyData.length, // Will be ignored if data isn't an array
    data: {
      [field]: readyData,
    },
  });
};

export default sendData;
