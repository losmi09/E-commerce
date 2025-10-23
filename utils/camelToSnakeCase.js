const camelToSnakeCase = validatedBody => {
  const convertCase = str =>
    str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  const values = Object.values(validatedBody);

  const snakeCaseKeys = Object.keys(validatedBody).map(key => convertCase(key));

  const newValue = {};

  snakeCaseKeys.forEach((key, i) => {
    newValue[key] = values[i];
  });

  return newValue;
};

export default camelToSnakeCase;
