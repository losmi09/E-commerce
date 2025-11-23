const excludeFromQuery = (query, ...fields) =>
  fields.forEach(field => delete query[field]);

const sort = (query, defaultSort) => {
  const queryCopy = structuredClone(query);

  if (!queryCopy.sort) queryCopy.sort = defaultSort;

  const sortBy = queryCopy.sort.split(',');

  // Create an array of sort criteria objects
  const orderBy = Array.from({ length: sortBy.length }, () => ({}));

  // Add asc or desc at the end of sort criteria: [ { price: 'desc' }, { createdAt: 'asc' } ]
  queryCopy.sort.split(',').forEach((el, i) => {
    if (el.includes('-')) orderBy[i][el.slice(1)] = 'desc';
    else orderBy[i][el] = 'asc';
  });

  excludeFromQuery(query, 'page', 'limit', 'sort');

  return { orderBy };
};

export default sort;
